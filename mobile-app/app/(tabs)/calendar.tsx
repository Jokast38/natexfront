import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, DateData } from "react-native-calendars";
import dayjs from "dayjs";
import "dayjs/locale/fr";

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
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://192.168.1.212:3000/api";

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/observations`);
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = await res.json();
        if (mounted && Array.isArray(data) && data.length) {
          setObservations(data.map((d: any) => ({ id: String(d.id || d._id || Math.random()), uri: d.photo ? `${BACKEND_URL}/${d.photo}` : d.uri, createdAt: d.created_at || d.createdAt || new Date().toISOString() })));
        } else if (mounted) {
          setObservations(MOCK_OBSERVATIONS);
        }
      } catch (err) {
        console.warn('Erreur de récupération, fallback mock', err);
        if (mounted) setObservations(MOCK_OBSERVATIONS);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📅 Carnet d’exploration</Text>

      <Calendar
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
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
                <TouchableOpacity style={styles.imageWrap} onPress={() => console.log('Photo sélectionnée :', item.uri)}>
                  <Image source={{ uri: item.uri }} style={styles.image} />
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
  imageWrap: { flex: 1 / 3, aspectRatio: 1, margin: 4, borderRadius: 10, overflow: 'hidden', backgroundColor: '#ddd' },
  image: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#777', marginTop: 20 },
  infoText: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 16 },
});
