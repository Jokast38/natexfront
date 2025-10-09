import React, { useEffect, useState, useRef, useCallback } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Image, Text, Platform, DeviceEventEmitter } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
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

function PhotoMap({ photos, current, mapRef }: { photos: PhotoPoint[]; current?: { latitude: number; longitude: number }; mapRef?: React.RefObject<any> }) {
  const initial = photos[0] || (current ? { latitude: current.latitude, longitude: current.longitude } : { latitude: 48.8566, longitude: 2.3522 });
  const localRef = React.useRef<any>(null);
  const usedMapRef = (mapRef as any) ?? localRef;

  // when current changes, animate the map to the user's location
  React.useEffect(() => {
    if (current && usedMapRef.current) {
      try {
        usedMapRef.current.animateToRegion({ latitude: current.latitude, longitude: current.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
      } catch (e) {
        // ignore
      }
    }
  }, [current, usedMapRef]);
  return (
    <MapView
      ref={usedMapRef}
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
          <Callout tooltip={Platform.OS === 'android'}>
            <View style={styles.calloutBubble}>
              {photo.uri ? <Image source={{ uri: photo.uri }} style={styles.calloutImage} /> : null}
              <View style={styles.calloutTextWrap}>
                <Text style={styles.calloutTitle}>{photo.legend ?? 'Photo'}</Text>
                {photo.locationName ? <Text style={styles.calloutSubtitle}>{photo.locationName}</Text> : null}
                {photo.createdAt ? <Text style={styles.calloutDate}>{new Date(photo.createdAt).toLocaleString()}</Text> : null}
              </View>
              {/* arrow for tooltip on Android / custom bubble */}
              {Platform.OS === 'android' && (
                <>
                  <View style={styles.calloutArrowBorder} />
                  <View style={styles.calloutArrow} />
                </>
              )}
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
  const mapRef = useRef<any>(null);

  // fetch observations from backend (reusable)
  const fetchPhotos = useCallback(async () => {
    try {
      const base = ENV_BACKEND_URL || 'http://192.168.1.212:3000/api';
      const res = await fetch(`${base}/observations`);
      if (!res.ok) throw new Error('Fetch failed');
      const j = await res.json();
      const list = Array.isArray(j?.observations) ? j.observations : [];
      const mapped = list
        .filter((o: any) => (o.lat !== undefined && o.lng !== undefined && o.lat !== null && o.lng !== null))
        .map((o: any) => ({
          id: String(o.id),
          uri: o.imageUrl || o.imageURL || '',
          latitude: Number(o.lat),
          longitude: Number(o.lng),
          legend: o.legend || o.caption || '',
          locationName: o.locationName || '',
          createdAt: o.createdAt || o.created_at || undefined,
        }));
      setPhotos(mapped);
    } catch (err) {
      console.warn('Failed to fetch observations for map', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // initial fetch
    if (mounted) fetchPhotos();

    // listen for observation creations and refresh
    const eventSub = DeviceEventEmitter.addListener('observation:created', () => {
      fetchPhotos();
    });

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
      // remove event listener
      eventSub.remove();
    };
  }, [fetchPhotos]);
  // no animated pulse - current position is a static green dot updated in real-time

  // when screen comes into focus, center map on current position if available
  useFocusEffect(
    React.useCallback(() => {
      // refresh data when screen is focused
      fetchPhotos();

      if (current && mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
        try {
          mapRef.current.animateToRegion({ latitude: current.latitude, longitude: current.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
        } catch (e) {
          // ignore
        }
      }
    }, [current, fetchPhotos])
  );

  return (
    <SafeAreaView style={{ flex: 1 , width: '100%', height: '100%'}}>
      <PhotoMap photos={photos} current={current} mapRef={mapRef} />
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
    width: 56,
    height: 56,
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
  currentOuter: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,200,0,0.15)' },
  currentDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#00C853', borderWidth: 2, borderColor: '#fff' },
  // Custom callout bubble for Android (tooltip)
  calloutBubble: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    minWidth: 220,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  calloutArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: [{ translateX: -8 }],
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  calloutArrowBorder: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0,0,0,0.12)',
  },
});
