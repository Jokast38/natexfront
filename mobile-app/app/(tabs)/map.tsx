import React, { useMemo } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type PhotoPoint = {
  id: string;
  uri: string;
  latitude: number;
  longitude: number;
};

interface Props {
  photos: PhotoPoint[];
}

function PhotoMap({ photos }: Props) {
  const initial = photos[0];
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: initial?.latitude ?? 48.8566,
        longitude: initial?.longitude ?? 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {photos.map((photo) => (
        <Marker
          key={photo.id}
          coordinate={{ latitude: photo.latitude, longitude: photo.longitude }}
        >
          <View style={styles.markerContainer}>
            <Image source={{ uri: photo.uri }} style={styles.markerImage} />
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

export default function MapScreen() {
  // mock photos around Paris
  const photos = useMemo<PhotoPoint[]>(() => [
    { id: '1', uri: 'https://picsum.photos/seed/1/200', latitude: 48.8566, longitude: 2.3522 },
    { id: '2', uri: 'https://picsum.photos/seed/2/200', latitude: 48.86, longitude: 2.34 },
    { id: '3', uri: 'https://picsum.photos/seed/3/200', latitude: 48.85, longitude: 2.36 },
  ], []);

  return (
    <SafeAreaView style={{ flex: 1 , width: '100%', height: '100%'}}>
      <PhotoMap photos={photos} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  markerContainer: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    width: 50,
    height: 50,
  },
  markerImage: { width: '100%', height: '100%' },
});
