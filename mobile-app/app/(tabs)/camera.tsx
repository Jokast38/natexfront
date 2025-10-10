import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import observationService from "@/src/services/observationService";
import {useSelector} from "react-redux";
import {RootState} from "@/src/redux/store";

export default function CameraScreen() {
    const {user} = useSelector((state: RootState) => state.user);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [legend, setLegend] = useState<string>("");
  const [legendModalVisible, setLegendModalVisible] = useState(false);

  // 📷 Capture de la photo
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setLegend("");
      setLegendModalVisible(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de prendre la photo");
    }
  };

  // 🚀 Envoi via observationService
  const uploadObservation = async () => {
    if (!photoUri) return;
    setUploading(true);

    try {
      let lat: number | null = null;
      let lng: number | null = null;
      let locationName: string | null = null;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;
        try {
          const places = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });
          if (places && places.length > 0) {
            const p = places[0] as any;
            locationName = `${p.name || p.street || 'Lieu inconnu'}, ${p.city || p.region || ''}`.replace(/,\s*$/, '');
          }
        } catch (e) {
          console.warn('Reverse geocode failed', e);
        }
      }

      await observationService.createObservation({
        userId: user.id,
        imageUri: photoUri,
        legend,
        lat: lat?.toString(),
        lng: lng?.toString(),
        locationName,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Succès", "Photo envoyée !");
    } catch (err: any) {
      console.error("Erreur upload :", err);
      Alert.alert("Erreur", "Échec de l'envoi de la photo.");
    } finally {
      setUploading(false);
      setLegendModalVisible(false);
      setPhotoUri(null);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Autorisez l'accès à la caméra</Text>
        <Button title="Autoriser" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} />

      <View style={styles.bottomControls}>
        {uploading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <TouchableOpacity style={styles.shutter} onPress={takePicture} />
        )}
      </View>

      {/* Modal légende */}
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
              <TouchableOpacity
                onPress={() => setLegendModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={{ color: "#777" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={uploading}
                onPress={uploadObservation}
                style={styles.submitBtn}
              >
                <Text style={{ color: "#fff" }}>
                  {uploading ? "Envoi..." : "Envoyer"}
                </Text>
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
  text: { color: "#fff" },
  bottomControls: { position: "absolute", bottom: 40, alignSelf: "center" },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    opacity: 0.8,
  },
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  cancelBtn: { padding: 10, marginRight: 10 },
  submitBtn: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 8 },
});