import React, { useRef, useState, useEffect } from "react";
import { View, Button, StyleSheet, Text, Alert, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  // prefer the typed ref, fallback to any for runtime safety
  const cameraRef = useRef<any>(null);
  // CameraType in expo-camera is sometimes exported only as a type; use string literals for runtime
  const [type, setType] = useState<'back' | 'front'>('back');
  const lastTapRef = useRef<number | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.center}>
        <Button title="Autoriser la caméra" onPress={requestPermission} />
      </View>
    );

  // Fonction pour prendre une photo (basée sur votre exemple)
  const takePicture = async (): Promise<void> => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log("Photo prise :", photo.uri);
        Alert.alert("Photo prise", photo.uri);
        // TODO: envoyer la photo au backend ou la sauvegarder localement
      } catch (error) {
        console.error("Erreur lors de la capture :", error);
        Alert.alert("Erreur", "Impossible de prendre la photo");
      }
    }
  };

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // ms
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // double tap detected -> toggle camera
      setType((prev) => (prev === 'back' ? 'front' : 'back'));
  setInfoMsg((prev) => (prev === "Selfie" ? "Arrière" : "Selfie"));
      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
    }
  };

  useEffect(() => {
    if (!infoMsg) return;
    const t = setTimeout(() => setInfoMsg(null), 900);
    return () => clearTimeout(t);
  }, [infoMsg]);

  return (
    <View style={styles.container}>
      <Pressable style={styles.camera} onPress={handlePress}>
        <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing={type} />
      </Pressable>

      {infoMsg ? (
        <View style={styles.infoBox} pointerEvents="none">
          <Text style={styles.infoText}>{infoMsg}</Text>
        </View>
      ) : null}

      <View style={styles.buttonWrap}>
        <Button title="📸 Prendre une photo" onPress={takePicture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  buttonWrap: { position: "absolute", bottom: 24, left: 16, right: 16 },
  infoBox: {
    position: 'absolute',
    top: 48,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoText: { color: '#fff', fontWeight: '600' },
});
