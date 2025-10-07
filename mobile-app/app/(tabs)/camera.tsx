import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";

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
      Alert.alert("Photo capturée", "Image sauvegardée localement !");
      await uploadObservation(photo.uri);
    } catch (error) {
      console.error("Erreur de capture :", error);
      Alert.alert("Erreur", "Impossible de prendre la photo");
    }
  };

  // 🌍 Envoi de la photo + position
  const BACKEND_URL = "http://10.0.2.2:4000";

  const uploadObservation = async (uri: string) => {
    setUploading(true);
    try {
      // Demande de permission GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission GPS refusée");
      }

      // Récupération de la position
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Préparation du formulaire
      const form = new FormData();
      const filename = uri.split("/").pop() || "photo.jpg";
      const ext = filename.split(".").pop();
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";

      // @ts-ignore
      form.append("photo", { uri, name: filename, type: mimeType });
      form.append("lat", String(latitude));
      form.append("lng", String(longitude));

      // Envoi vers le backend
      const response = await fetch(`${BACKEND_URL}/observations`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Échec de l'upload : ${errorText}`);
      }

      const result = await response.json();
      Alert.alert("✅ Upload réussi", `Observation enregistrée (id: ${result.id || "?"})`);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Erreur d’envoi", err.message || "Impossible d’envoyer la photo");
    } finally {
      setUploading(false);
    }
  };

  // 🔁 Double-tap pour changer la caméra
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      setFacing((prev) => (prev === "back" ? "front" : "back"));
      setInfoMsg(facing === "back" ? "Selfie" : "Arrière");
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
          <Button title="📸 Prendre une photo" onPress={takePicture} />
        )}
      </View>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 10,
  },
});
