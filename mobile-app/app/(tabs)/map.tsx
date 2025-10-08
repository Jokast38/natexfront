import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Image, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { BACKEND_URL as ENV_BACKEND_URL } from '../config/env';

type PhotoPoint = {
  id: string;
  uri: string;
  latitude: number;
  longitude: number;
  legend?: string;
  locationName?: string;
  createdAt?: string;
};

function PhotoMap({ photos, current }: { photos: PhotoPoint[]; current?: { latitude: number; longitude: number } }) {
  const initial = photos[0] || (current ? { latitude: current.latitude, longitude: current.longitude } : { latitude: 48.8566, longitude: 2.3522 });
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: initial.latitude ?? 48.8566,
        longitude: initial.longitude ?? 2.3522,
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
          <Callout>
            <View style={styles.calloutContainer}>
              {photo.uri ? <Image source={{ uri: photo.uri }} style={styles.calloutImage} /> : null}
              <View style={styles.calloutTextWrap}>
                <Text style={styles.calloutTitle}>{photo.legend ?? 'Photo'}</Text>
                {photo.locationName ? <Text style={styles.calloutSubtitle}>{photo.locationName}</Text> : null}
                {photo.createdAt ? <Text style={styles.calloutDate}>{new Date(photo.createdAt).toLocaleString()}</Text> : null}
              </View>
            </View>
          </Callout>
        </Marker>
      ))}

      {current && (
        <Marker coordinate={{ latitude: current.latitude, longitude: current.longitude }} tracksViewChanges={false}>
          <View style={styles.currentMarkerWrap}>
            <View style={styles.currentOuter} />
            <View style={styles.currentDot} />
          </View>
        </Marker>
      )}
    </MapView>
  );
}

export default function MapScreen() {
  const [photos, setPhotos] = useState<PhotoPoint[]>([]);
  const [current, setCurrent] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const locationSubscriptionRef = useRef<any>(null);

  // fetch observations from backend
  useEffect(() => {
    let mounted = true;
    const fetchPhotos = async () => {
      try {
        const base = ENV_BACKEND_URL || 'http://192.168.1.212:3000/api';
        const res = await fetch(`${base}/observations`);
        if (!res.ok) throw new Error('Fetch failed');
        const j = await res.json();
        const list = Array.isArray(j?.observations) ? j.observations : [];
        if (!mounted) return;
        const mapped = list
          .filter((o: any) => (o.lat !== undefined && o.lng !== undefined && o.lat !== null && o.lng !== null))
          .map((o: any) => ({
            id: String(o.id),
            uri: o.imageUrl || o.imageURL || '',
            latitude: Number(o.lat),
            longitude: Number(o.lng),
            legend: o.legend || o.caption || '',
            locationName: o.locationName || '',
            createdAt: o.createdAt || o.createdAt,
          }));
        setPhotos(mapped);
      } catch (err) {
        console.warn('Failed to fetch observations for map', err);
      }
    };
    fetchPhotos();

    // subscribe to current position (real-time)
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // try to get an immediate position first
          const pos = await Location.getCurrentPositionAsync({});
          if (mounted) setCurrent({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });

          // then watch for updates
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Highest,
              timeInterval: 5000,
              distanceInterval: 5,
            },
            (p) => {
              if (mounted) setCurrent({ latitude: p.coords.latitude, longitude: p.coords.longitude });
            }
          );
          locationSubscriptionRef.current = sub;
        }
      } catch (e) {
        console.warn('Location error', e);
      }
    })();

    return () => {
      mounted = false;
      // remove subscription if present
      if (locationSubscriptionRef.current && typeof locationSubscriptionRef.current.remove === 'function') {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);
  // no animated pulse - current position is a static green dot updated in real-time

  return (
    <SafeAreaView style={{ flex: 1 , width: '100%', height: '100%'}}>
      <PhotoMap photos={photos} current={current} />
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
  calloutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 200,
  },
  calloutImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 8,
  },
  calloutTextWrap: {
    flex: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  calloutDate: {
    fontSize: 10,
    color: '#999',
  },
  currentMarkerWrap: { alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,0,0,0.3)' },
  currentOuter: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,0,0,0.2)' },
  currentDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'red', borderWidth: 2, borderColor: '#fff' },
});
