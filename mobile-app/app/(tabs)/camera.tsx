import React, { useRef, useState, useEffect, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
// We upload files to the backend and let the server handle Cloudinary (safer, avoids unsigned preset issues)
// Use local config file to avoid Metro resolution issues with @env during dev
import { BACKEND_URL as ENV_BACKEND_URL } from "../config/env";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraScreen(): JSX.Element {
  // 🔐 Permissions caméra
  const [permission, requestPermission] = useCameraPermissions();

  // 📸 Référence vers la caméra
  const cameraRef = useRef<CameraView | null>(null);

  // ⚙️ États locaux
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [uploading, setUploading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const lastTapRef = useRef<number | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [legend, setLegend] = useState<string>("");
  const [legendModalVisible, setLegendModalVisible] = useState(false);

  const PENDING_KEY = 'PENDING_UPLOADS_V1';

  // Helper: add a pending upload to AsyncStorage
  const addPendingUpload = async (item: any) => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(item);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(arr));
      console.log('Saved pending upload', item.id);
    } catch (e) {
      console.warn('Failed to save pending upload', e);
    }
  };

  const removePendingUpload = async (id: string) => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const filtered = arr.filter((x: any) => x.id !== id);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
      console.log('Removed pending upload', id);
    } catch (e) {
      console.warn('Failed to remove pending upload', e);
    }
  };

  // Attempt to flush pending uploads stored in AsyncStorage
  const flushPendingUploads = async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.length) return;
      console.log('Flushing pending uploads', arr.length);
      for (const item of arr) {
        try {
          // Try backend multipart upload (backend should accept 'photo' file)
          const form = new FormData();
          // @ts-ignore
          form.append('photo', { uri: item.uri, name: item.filename || 'photo.jpg', type: item.type || 'image/jpeg' });
          if (item.lat) form.append('lat', String(item.lat));
          if (item.lng) form.append('lng', String(item.lng));
          if (item.locationName) form.append('locationName', item.locationName);
          if (item.legend) form.append('legend', item.legend);

          const rawRes = await fetch(`${BACKEND_URL}/observations`, { method: 'POST', body: form });
          if (rawRes.ok) {
            await removePendingUpload(item.id);
            console.log('Pending upload succeeded', item.id);
          } else {
            console.warn('Pending upload failed', item.id, await rawRes.text());
          }
        } catch (err) {
          console.warn('Error flushing pending upload', item.id, err);
        }
      }
    } catch (e) {
      console.warn('Failed to flush pending uploads', e);
    }
  };

  // flush on mount
  useEffect(() => { flushPendingUploads(); }, []);

  // 🔔 Configuration des notifications locales
  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    })();
  }, []);

  // 🔔 Effet : effacer le message d’info après 1 seconde
  useEffect(() => {
    if (!infoMsg) return;
    const timeout = setTimeout(() => setInfoMsg(null), 1000);
    return () => clearTimeout(timeout);
  }, [infoMsg]);

  // 🛑 Gestion des permissions
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Autorisez l'accès à la caméra pour continuer</Text>
        <Button title="📷 Autoriser la caméra" onPress={requestPermission} />
      </View>
    );
  }

  // 🧭 Message d’avertissement pour le web
  if (Platform.OS === "web") {
    return (
      <View style={styles.center}>
        <Text>🚫 Caméra non disponible sur le web.</Text>
        <Text>Testez cette fonctionnalité dans Expo Go ou sur un simulateur.</Text>
      </View>
    );
  }

  // 📷 Capture d’une photo
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      console.log("📸 Photo prise :", photo?.uri);

      // keep uri and ask for legend before uploading
      setPhotoUri(photo.uri);
      setLegend("");
      setLegendModalVisible(true);
      // 💥 Vibration courte pour signaler la capture
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Simple feedback; no push notification yet — we'll notify after upload succeeds/fails
      Alert.alert("Photo capturée", "Ajoute une légende avant l'envoi.");
    } catch (error) {
      console.error("Erreur de capture :", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erreur", "Impossible de prendre la photo");
    }
  };

  // 🌍 Envoi de la photo : upload Cloudinary puis enregistrement backend
  const BACKEND_URL = ENV_BACKEND_URL || "http://192.168.1.212:3000/api";

  const uploadObservation = async (uri: string, legendText: string = "") => {
    setUploading(true);
    let lat: number | null = null;
    let lng: number | null = null;
    let locationName: string | null = null;

    try {
      // Demande de permission GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;

        try {
          const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (places && places.length > 0) {
            const p = places[0] as any;
            locationName = `${p.name || p.street || 'Lieu inconnu'}, ${p.city || p.region || ''}`.replace(/,\s*$/, '');
          }
        } catch (e) {
          console.warn('Reverse geocode failed', e);
        }
      }
    } catch (e) {
      console.warn('Location unavailable', e);
    }

    try {
      // Send the file to backend as multipart/form-data. The backend will upload to Cloudinary.
      const form = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = filename.match(/\.(\w+)$/);
      const ext = match ? match[1] : 'jpg';
      const type = ext === 'png' ? 'image/png' : 'image/jpeg';
      // @ts-ignore
      form.append('photo', { uri, name: filename, type });
      if (lat && lng) {
        form.append('lat', String(lat));
        form.append('lng', String(lng));
      }
      if (locationName) form.append('locationName', locationName);
      if (legendText) form.append('legend', legendText);

      const raw = await fetch(`${BACKEND_URL}/observations`, { method: 'POST', body: form });
      if (!raw.ok) {
        const t = await raw.text();
        throw new Error(`Backend multipart upload failed: ${t || raw.status}`);
      }

      const j = await raw.json();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Notifications.scheduleNotificationAsync({ content: { title: '✅ Upload réussi', body: `📍 ${locationName || 'Lieu non identifié'}` }, trigger: null });
      Alert.alert('✅ Upload réussi', `Observation enregistrée (id: ${j.id || '?'})`);
    } catch (err: any) {
      console.error('Upload error:', err);
      // Save to pending uploads to retry later
      try {
        const id = String(Date.now()) + '-' + Math.floor(Math.random() * 10000);
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = filename.match(/\.(\w+)$/);
        const ext = match ? match[1] : 'jpg';
        const type = ext === 'png' ? 'image/png' : 'image/jpeg';
        await addPendingUpload({ id, uri, filename, type, lat, lng, locationName, legend: legendText });
        console.log('Saved failed upload to pending queue', id);
      } catch (saveErr) {
        console.warn('Failed to save pending upload', saveErr);
      }
      // send failure notification
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '❌ Upload échoué',
            body: String(err.message || 'Erreur lors de l\'envoi'),
          },
          trigger: null,
        });
      } catch (e) {
        console.warn('Failed to send failure notification', e);
      }

      // If it's a Cloudinary preset error, give actionable hint
      const msg = String(err.message || 'Impossible d\'envoyer la photo');
      if (msg.toLowerCase().includes('upload preset') || msg.toLowerCase().includes('preset not found')) {
        Alert.alert('Upload échoué', 'Le preset Cloudinary spécifié est introuvable. Vérifie que le `CLOUDINARY_UPLOAD_PRESET` existe et est configuré en mode "unsigned" dans ton tableau de bord Cloudinary.');
      } else {
        Alert.alert('Erreur d’envoi', msg);
      }
    } finally {
      setUploading(false);
      setLegendModalVisible(false);
      setPhotoUri(null);
    }
  };

  // 🔁 Double-tap pour changer la caméra
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setFacing((prev) => (prev === "back" ? "front" : "back"));
      setInfoMsg(facing === "back" ? "Selfie" : "Arrière");

      // 💥 Vibration légère au changement
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
    }
  };

  // 🧭 Rendu de la vue caméra
  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDoubleTap}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="picture"
        />
      </Pressable>

      {infoMsg && (
        <View style={styles.infoBox} pointerEvents="none">
          <Text style={styles.infoText}>{infoMsg}</Text>
        </View>
      )}

      <View style={styles.bottomControls}>
        {uploading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Pressable
            onPress={takePicture}
            style={({ pressed }) => [
              styles.shutter,
              pressed ? styles.shutterPressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Prendre une photo"
            android_ripple={{ color: "rgba(255,255,255,0.2)", radius: 60 }}
          >
            <View style={styles.shutterInner} />
          </Pressable>
        )}
      </View>

      {/* Modal pour la saisie de la légende */}
      <Modal visible={legendModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter une légende</Text>
            <TextInput
              placeholder="Ex : Belle plante au bord du lac..."
              style={styles.input}
              value={legend}
              onChangeText={setLegend}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setLegendModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#777' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => { if (photoUri) await uploadObservation(photoUri, legend || 'Sans légende'); }} style={styles.submitBtn}>
                <Text style={{ color: '#fff' }}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#444", fontSize: 16, marginBottom: 10 },
  infoBox: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoText: { color: "#fff", fontWeight: "600" },
  bottomControls: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.0)",
    borderRadius: 12,
    padding: 10,
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  shutterPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
  },
  // --- Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  cancelBtn: { padding: 10, marginRight: 10 },
  submitBtn: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 8 },
});
