import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import { Calendar, DateData } from "react-native-calendars";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { BACKEND_URL as ENV_BACKEND_URL } from '../config/env';

dayjs.locale("fr");

type Observation = {
  id: string;
  uri: string;
  createdAt: string;
};

const MOCK_OBSERVATIONS: Observation[] = [
  { id: '1', uri: 'https://picsum.photos/seed/c1/400', createdAt: '2025-10-06T10:12:00Z' },
  { id: '2', uri: 'https://picsum.photos/seed/c2/400', createdAt: '2025-10-06T11:30:00Z' },
  { id: '3', uri: 'https://picsum.photos/seed/c3/400', createdAt: '2025-10-05T09:00:00Z' },
  { id: '4', uri: 'https://picsum.photos/seed/c4/400', createdAt: '2025-10-05T12:22:00Z' },
  { id: '5', uri: 'https://picsum.photos/seed/c5/400', createdAt: '2025-10-04T18:05:00Z' },
  { id: '6', uri: 'https://picsum.photos/seed/c6/400', createdAt: '2025-10-04T20:20:00Z' },
];

export default function CalendarScreen() {
  const router = useRouter();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = ENV_BACKEND_URL || "http://10.0.2.2:3000/api";

  // fetchData is used on mount, on focus and when an 'observation:created' event is emitted
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/observations`);
      if (!res.ok) throw new Error("Erreur de chargement");
      const payload = await res.json();
      const arr = Array.isArray(payload) ? payload : (Array.isArray(payload?.observations) ? payload.observations : []);
      if (arr.length) {
        const rootBase = BACKEND_URL.replace(/\/api\/?$/i, '').replace(/\/$/, '');
        setObservations(arr.map((d: any) => ({
          id: String(d.id || d._id || Math.random()),
          uri: d.imageUrl || d.imageURL || d.uri || (d.photo ? `${rootBase}/${String(d.photo).replace(/^\//, '')}` : ''),
          createdAt: d.createdAt || d.created_at || new Date().toISOString(),
        })));
      } else {
        setObservations(MOCK_OBSERVATIONS);
      }
    } catch (err) {
      console.warn('Erreur de récupération, fallback mock', err);
      setObservations(MOCK_OBSERVATIONS);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    // initial load
    fetchData();

    // listen for JS events (optional) to trigger immediate refresh
    const sub = DeviceEventEmitter.addListener('observation:created', () => {
      fetchData();
    });

    return () => {
      sub.remove();
    };
  }, [fetchData]);

  // re-fetch when screen is focused (e.g. after navigating back from camera)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Chargement du calendrier...</Text>
      </SafeAreaView>
    );
  }

  const groupedByDate = observations.reduce((acc: Record<string, Observation[]>, obs) => {
    const dateKey = dayjs(obs.createdAt).format('YYYY-MM-DD');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(obs);
    return acc;
  }, {});

  const markedDates = Object.keys(groupedByDate).reduce((acc: Record<string, any>, date) => {
    acc[date] = { marked: true, dotColor: '#4CAF50', selected: date === selectedDate, selectedColor: '#81C784' };
    return acc;
  }, {});

  const dailyPhotos = selectedDate ? groupedByDate[selectedDate] || [] : [];

  const renderDay = (day: DateData, onPress?: (d: DateData) => void) => {
    const key = day.dateString;
    const items = groupedByDate[key] || [];
    const thumb = items[0]?.uri;
    const isToday = dayjs().format('YYYY-MM-DD') === day.dateString;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setSelectedDate(day.dateString);
          if (onPress) onPress(day);
        }}
        style={styles.dayCell}
      >
        <Text style={[styles.dayText, isToday ? styles.todayText : null]}>{String(day.day)}</Text>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.dayThumb} />
        ) : null}
        {items.length > 1 ? (
          <View style={styles.countBadge}><Text style={styles.countText}>{items.length}</Text></View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📅 Carnet d’exploration</Text>

      <Calendar
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        dayComponent={({ date, state, marking, onPress }) => date ? renderDay(date, onPress) : null}
        theme={{ arrowColor: '#4CAF50', todayTextColor: '#4CAF50', selectedDayBackgroundColor: '#81C784' }}
      />

      {selectedDate ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{dayjs(selectedDate).format('dddd D MMMM YYYY')}</Text>
          {dailyPhotos.length ? (
            <FlatList
              data={dailyPhotos}
              keyExtractor={(item) => item.id}
              numColumns={3}
                contentContainerStyle={{ paddingHorizontal: 8 }}
                renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.imageWrap}
                  onPress={() => {
                    // navigate to photos screen and pass photoId + date
                    router.push({
                      pathname: '/photos',
                      params: {
                        photoId: item.id,
                        ...(selectedDate && { date: selectedDate })
                      }
                    });
                  }}
                >
                  <Image source={{ uri: item.uri }} style={styles.image} />
                  <View style={styles.imageOverlay}>
                    <Text numberOfLines={1} style={styles.imageCaption}>{dayjs(item.createdAt).format('HH:mm')}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>🌥️ Aucune photo pour ce jour.</Text>
          )}
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.infoText}>Sélectionne une date pour voir tes photos 🌿</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { textAlign: 'center', fontSize: 20, fontWeight: '700', marginVertical: 16, color: '#2E7D32' },
  section: { flex: 1, marginTop: 10, paddingHorizontal: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#388E3C', textTransform: 'capitalize' },
  grid: { justifyContent: 'space-between' },
  imageWrap: { flex: 1 / 3, aspectRatio: 1, margin: 6, borderRadius: 12, overflow: 'hidden', backgroundColor: '#eee', elevation: 2 },
  image: { width: '100%', height: '100%', borderRadius: 12 },
  imageOverlay: { position: 'absolute', left: 6, right: 6, bottom: 6, backgroundColor: 'rgba(0,0,0,0.35)', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 8, alignItems: 'center' },
  imageCaption: { color: '#fff', fontSize: 12, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 20 },
  infoText: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 16 },
  dayCell: { width: 44, height: 54, alignItems: 'center', justifyContent: 'flex-start' },
  dayText: { fontSize: 12, color: '#333' },
  todayText: { color: '#2E7D32', fontWeight: '700' },
  dayThumb: { width: 36, height: 36, borderRadius: 6, marginTop: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  countBadge: { position: 'absolute', right: -2, top: -2, backgroundColor: '#4CAF50', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  countText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
