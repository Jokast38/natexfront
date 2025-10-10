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
// Load expo-notifications dynamically to avoid automatic push-token registration in Expo Go
import { DeviceEventEmitter } from 'react-native';
import Constants from 'expo-constants';
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
  const [zoom, setZoom] = useState<number>(0); // value between 0 (no zoom) and 1 (max)
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
      if (!Array.isArray(arr) || arr.length === 0) return;
      console.log('Flushing pending uploads', arr.length);
      for (const item of arr) {
        try {
          const form = new FormData();
          // @ts-ignore
          form.append('photo', { uri: item.uri, name: item.filename || 'photo.jpg', type: item.type || 'image/jpeg' });
          if (item.lat) form.append('lat', String(item.lat));
          if (item.lng) form.append('lng', String(item.lng));
          if (item.locationName) form.append('locationName', item.locationName);
          if (item.legend) form.append('legend', item.legend);

          const res = await fetch(`${BACKEND_URL}/observations`, { method: 'POST', body: form });
          if (res.ok) {
            await removePendingUpload(item.id);
            console.log('Pending upload succeeded', item.id);
            try { DeviceEventEmitter.emit('observation:created'); } catch (e) { /* ignore */ }
          } else {
            console.warn('Pending upload failed', item.id, await res.text());
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
      // If running inside Expo Go, skip loading expo-notifications to avoid automatic push registration
      if (Constants?.appOwnership === 'expo') {
        return;
      }
      try {
        const Notifications = await import('expo-notifications');
        if (Notifications) {
          try {
            await Notifications.requestPermissionsAsync();
          } catch (e) {
            // ignore permission failures in dev
            console.warn('Notifications permission request failed', e);
          }
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
        }
      } catch (e) {
        // dynamic import failed (likely in an environment without the native module)
        console.warn('expo-notifications not available', e);
      }
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
      // Simple transient feedback shown in-app (no blocking alert)
      setInfoMsg('Photo capturée — ajoute une légende');
    } catch (error) {
      console.error("Erreur de capture :", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erreur", "Impossible de prendre la photo");
    }
  };

  // 🌍 Envoi de la photo : upload Cloudinary puis enregistrement backend
  const BACKEND_URL = ENV_BACKEND_URL || "http://10.0.2.2:3000/api";

  const uploadObservation = async (uri: string, legendText: string = "") => {
    setUploading(true);
    let lat: number | null = null;
    let lng: number | null = null;
    let locationName: string | null = null;

    try {
      // get location if permission
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
        } catch (e) { console.warn('Reverse geocode failed', e); }
      }

      const form = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = filename.match(/\.(\w+)$/);
      const ext = match ? match[1] : 'jpg';
      const type = ext === 'png' ? 'image/png' : 'image/jpeg';
      // @ts-ignore
      form.append('photo', { uri, name: filename, type });
      if (lat !== null) form.append('lat', String(lat));
      if (lng !== null) form.append('lng', String(lng));
      if (locationName) form.append('locationName', locationName);
      if (legendText) form.append('legend', legendText);

      const res = await fetch(`${BACKEND_URL}/observations`, { method: 'POST', body: form });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }

      const body = await res.json().catch(() => ({}));
      // feedback: gentle, non-blocking
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInfoMsg('Upload réussi');
      try {
        if (Constants?.appOwnership === 'expo') {
          // skip scheduling local notifications in Expo Go
        } else {
          const Notifications = await import('expo-notifications');
          if (Notifications && typeof Notifications.scheduleNotificationAsync === 'function') {
            await Notifications.scheduleNotificationAsync({ content: { title: 'Upload réussi', body: locationName || 'Observation enregistrée' }, trigger: null });
          }
        }
      } catch (e) {
        /* ignore */
      }
      try { DeviceEventEmitter.emit('observation:created'); } catch (e) { /* ignore */ }
      console.log('Upload success', body);
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
        setInfoMsg("Upload sauvé en file d'attente");
      } catch (saveErr) {
        console.warn('Failed to save pending upload', saveErr);
        Alert.alert('Erreur', 'Impossible de sauvegarder la photo pour réessayer plus tard.');
      }

      const msg = String(err?.message || 'Erreur lors de l\'envoi');
      if (msg.toLowerCase().includes('upload preset') || msg.toLowerCase().includes('preset not found')) {
        Alert.alert('Upload échoué', 'Le preset Cloudinary est introuvable. Vérifie la configuration serveur Cloudinary.');
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

  // Zoom handlers (0..1)
  const clampZoom = (v: number) => Math.max(0, Math.min(1, v));
  const increaseZoom = (step = 0.1) => setZoom((z) => clampZoom(Number((z + step).toFixed(2))));
  const decreaseZoom = (step = 0.1) => setZoom((z) => clampZoom(Number((z - step).toFixed(2))));

  // 🧭 Rendu de la vue caméra
  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDoubleTap}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          zoom={zoom}
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
          <View style={styles.controlsRow}>
            <View style={styles.zoomControls}>
              <TouchableOpacity disabled={facing === 'front' || uploading} onPress={() => decreaseZoom(0.1)} style={[styles.zoomBtn, (facing === 'front' || uploading) ? styles.disabledBtn : null]}>
                <Text style={styles.zoomText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.zoomValue}>{Math.round(1 + zoom * 3)}x</Text>
              <TouchableOpacity disabled={facing === 'front' || uploading} onPress={() => increaseZoom(0.1)} style={[styles.zoomBtn, (facing === 'front' || uploading) ? styles.disabledBtn : null]}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
            </View>

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
          </View>
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
            {/* Uploading indicator shown while uploading */}
            {uploading && (
              <View style={styles.uploadingWrap}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.uploadingText}>Envoi en cours…</Text>
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity disabled={uploading} onPress={() => setLegendModalVisible(false)} style={[styles.cancelBtn, uploading ? styles.disabledBtn : null]}>
                <Text style={{ color: uploading ? '#bbb' : '#777' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={uploading} onPress={async () => { if (photoUri) await uploadObservation(photoUri, legend || 'Sans légende'); }} style={[styles.submitBtn, uploading ? styles.disabledSubmit : null]}>
                <Text style={{ color: '#fff' }}>{uploading ? 'Envoi…' : 'Envoyer'}</Text>
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
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  zoomControls: { flexDirection: 'row', alignItems: 'center', marginRight: 12, backgroundColor: 'rgba(0,0,0,0.28)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 24 },
  zoomBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  zoomText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  zoomValue: { color: '#fff', marginHorizontal: 8, minWidth: 36, textAlign: 'center' },
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
  uploadingWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  uploadingText: { marginLeft: 8, color: '#4CAF50' },
  disabledBtn: { opacity: 0.6 },
  disabledSubmit: { backgroundColor: '#9CCC9C' },
});
