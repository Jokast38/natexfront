import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import * as Haptics from "expo-haptics"; // 🔔

// Optionnel : change la langue du formatage de date
dayjs.locale("fr");

type Observation = {
  id: string;
  uri: string;
  createdAt: string;
  lat?: number;
  lng?: number;
};

const MOCK_OBSERVATIONS: Observation[] = [
  { id: '1', uri: 'https://picsum.photos/seed/101/400', createdAt: '2025-10-06T10:12:00Z', lat: 48.8566, lng: 2.3522 },
  { id: '2', uri: 'https://picsum.photos/seed/102/400', createdAt: '2025-10-06T11:30:00Z', lat: 48.8576, lng: 2.345 },
  { id: '3', uri: 'https://picsum.photos/seed/103/400', createdAt: '2025-10-05T09:00:00Z', lat: 48.86, lng: 2.36 },
  { id: '4', uri: 'https://picsum.photos/seed/104/400', createdAt: '2025-10-05T12:22:00Z', lat: 48.853, lng: 2.349 },
  { id: '5', uri: 'https://picsum.photos/seed/105/400', createdAt: '2025-10-04T18:05:00Z', lat: 48.859, lng: 2.33 },
  { id: '6', uri: 'https://picsum.photos/seed/106/400', createdAt: '2025-10-04T20:20:00Z', lat: 48.855, lng: 2.358 },
  { id: '7', uri: 'https://picsum.photos/seed/107/400', createdAt: '2025-10-03T08:15:00Z', lat: 48.852, lng: 2.34 },
  { id: '8', uri: 'https://picsum.photos/seed/108/400', createdAt: '2025-10-03T13:45:00Z', lat: 48.858, lng: 2.351 },
  { id: '9', uri: 'https://picsum.photos/seed/109/400', createdAt: '2025-10-02T07:30:00Z', lat: 48.85, lng: 2.35 },
];

export default function GalleryScreen() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  // modal/gallery state hooks must be declared before any early returns
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const flatRef = useRef<FlatList<any> | null>(null);
  const window = Dimensions.get('window');

  // Share an image via native share sheet
  const shareImage = async (uri: string) => {
    try {
      await Share.share({ url: uri, message: uri });
    } catch (err) {
      console.warn('Share failed', err);
    }
  };

  // 🗑️ Suppression avec vibration au moment du dialogue
  const handleDelete = async (id: string) => {
    // 💥 Vibration forte pour signaler une action importante
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            // 🔔 Vibration courte au moment de la suppression effective
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setObservations((prev) => prev.filter((p) => p.id !== id));
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const BACKEND_URL = "http://10.0.2.2:4000";

  useEffect(() => {
    let mounted = true;

    const fetchObservations = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/observations`);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        if (mounted && Array.isArray(data) && data.length) {
          setObservations(data.map((d: any) => ({ id: String(d.id || d._id || Math.random()), uri: d.photo ? `${BACKEND_URL}/${d.photo}` : d.uri, createdAt: d.created_at || d.createdAt || new Date().toISOString(), lat: d.lat, lng: d.lng })));
        } else if (mounted) {
          // fallback to mock if backend empty
          setObservations(MOCK_OBSERVATIONS);
        }
      } catch (err) {
        console.warn("Fetch observations failed, using mock", err);
        if (mounted) setObservations(MOCK_OBSERVATIONS);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchObservations();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Chargement de la galerie...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!observations.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>🌱 Aucune observation pour l’instant</Text>
          <Text style={styles.emptySub}>Capture ta première photo depuis la caméra 📸</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Groupement des photos par date
  const groupedByDate = observations.reduce((groups: Record<string, Observation[]>, obs) => {
    const dateKey = dayjs(obs.createdAt).format("dddd D MMMM YYYY");
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(obs);
    return groups;
  }, {});

  const dateKeys = Object.keys(groupedByDate);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dateKeys}
        keyExtractor={(item) => item}
        renderItem={({ item: date }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{date}</Text>
            <View style={styles.grid}>
              {groupedByDate[date].map((obs, idx) => {
                // compute global index to open modal at correct item
                // We'll flatten grouped arrays to compute index when opening
                return (
                  <TouchableOpacity
                    key={obs.id}
                    style={styles.imageWrap}
                    onPress={() => {
                      // open modal at this photo
                      // compute index by summing previous groups
                      let idxAcc = 0;
                      for (const k of dateKeys) {
                        if (k === date) break;
                        idxAcc += groupedByDate[k].length;
                      }
                      const globalIndex = idxAcc + idx;
                      setSelectedIndex(globalIndex);
                      setModalVisible(true);
                      setShowInfo(false);
                      // scroll after modal opens
                      setTimeout(() => {
                        flatRef.current?.scrollToIndex({ index: globalIndex, animated: false });
                      }, 50);
                    }}
                  >
                    <Image source={{ uri: obs.uri }} style={styles.image} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />

      {/* Modal fullscreen gallery */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <FlatList
            ref={flatRef}
            data={dateKeys.reduce((acc: any[], k) => acc.concat(groupedByDate[k]), [] as any[])}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedIndex}
            getItemLayout={(_, index) => ({ length: window.width, offset: window.width * index, index })}
            renderItem={({ item }) => (
              <View style={[styles.modalPage, { width: window.width }]}>
                <TouchableOpacity
                  style={styles.modalImageWrap}
                  activeOpacity={1}
                  onLongPress={() => setShowInfo(true)}
                  onPress={() => setShowInfo(false)}
                >
                  <Image source={{ uri: item.uri }} style={styles.fullImage} resizeMode="contain" />
                </TouchableOpacity>
                {showInfo && (
                  <View style={styles.infoOverlay} pointerEvents="none">
                    <Text style={styles.infoText}>{dayjs(item.createdAt).format('LLL')}</Text>
                    <Text style={styles.infoText}>{item.lat ? `Lat: ${item.lat.toFixed(5)}` : 'Lat: —'} • {item.lng ? `Lng: ${item.lng.toFixed(5)}` : 'Lng: —'}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <View style={styles.modalHeader}>
            <Pressable style={styles.modalAction} onPress={() => {
              const flatData = dateKeys.reduce((acc: any[], k) => acc.concat(groupedByDate[k]), [] as any[]);
              const item = flatData[selectedIndex];
              if (item) shareImage(item.uri);
            }}>
              <Text style={styles.modalActionText}>Partager</Text>
            </Pressable>

            <Pressable style={styles.modalAction} onPress={() => {
              const flatData = dateKeys.reduce((acc: any[], k) => acc.concat(groupedByDate[k]), [] as any[]);
              const item = flatData[selectedIndex];
              if (item) handleDelete(item.id);
            }}>
              <Text style={[styles.modalActionText, { color: '#ff6666' }]}>Supprimer</Text>
            </Pressable>

            <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#fff', fontSize: 16 }}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, fontSize: 16, color: "#666" },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#333", textAlign: "center" },
  emptySub: { fontSize: 14, color: "#777", marginTop: 4, textAlign: "center" },
  section: { marginVertical: 12, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2E7D32",
    textTransform: "capitalize",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    // spacing managed via imageWrap margins
  },
  imageWrap: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ddd",
    marginRight: "3%",
    marginBottom: 8,
  },
  image: { width: "100%", height: "100%" },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalPage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalImageWrap: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  fullImage: { width: '100%', height: '100%' },
  infoOverlay: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 8 },
  infoText: { color: '#fff', textAlign: 'center' },
  modalClose: { position: 'absolute', top: 40, right: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  modalHeader: { position: 'absolute', top: 40, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalAction: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6 },
  modalActionText: { color: '#fff' },
});
