import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { typography } from "../../src/theme/typography";
import { colors } from "../../src/theme/color";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

// Mock user data while backend is not ready
const MOCK_USER = {
  firstName: 'Marie',
  lastName: 'Dupont',
  username: 'marie.dupont',
  bio: "Amoureuse de la nature • Observatrice d'oiseaux • Photographe amateur",
  stats: { observations: 42, photos: 128, badges: 3 },
};

export default function Profile() {
  const [firstName, setFirstName] = useState(MOCK_USER.firstName);
  const [lastName, setLastName] = useState(MOCK_USER.lastName);
  const [username] = useState(MOCK_USER.username);
  const [bio, setBio] = useState(MOCK_USER.bio);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const initials = useMemo(() => {
    const f = firstName?.trim()?.[0] ?? '';
    const l = lastName?.trim()?.[0] ?? '';
    return (f + l).toUpperCase();
  }, [firstName, lastName]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez l’accès à la galerie pour changer la photo de profil');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // @ts-ignore: result.uri exists on managed expo
        setImageUri(result.uri);
      }
    } catch (err) {
      console.error('ImagePicker error', err);
      Alert.alert('Erreur', "Impossible d'ouvrir la galerie");
    }
  };

  const handleSave = () => {
    // For now we only update local mock state. In the future call backend API.
    Alert.alert('Profil mis à jour', `Nom enregistré : ${firstName} ${lastName}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon profil</Text>
      </View>

      <View style={styles.centerProfile}>
        <Pressable onPress={pickImage} style={styles.avatarWrap} accessibilityRole="imagebutton">
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
        </Pressable>

        <TextInput
          value={`${firstName} - ${lastName}`} 
          onChangeText={text => {
            const [first, last] = text.split(' - ');
            setFirstName(first);
            setLastName(last);
          }}
          placeholder="Nom - Prénom"
          style={[styles.nameLargeInput, { fontFamily: typography.fontFamily.bold }]}
        />

        <Text style={[styles.username, { fontFamily: typography.fontFamily.regular, textAlign: 'center' }]}>@{username}</Text>
        <Text style={styles.bioText}>{bio}</Text>

        <View style={styles.statsRowCentered}>
          <View style={styles.statCentered}>
            <Text style={styles.statValue}>{MOCK_USER.stats.observations}</Text>
            <Text style={styles.statLabel}>Observations</Text>
          </View>
          <View style={styles.statCentered}>
            <Text style={styles.statValue}>{MOCK_USER.stats.photos}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCentered}>
            <Text style={styles.statValue}>{MOCK_USER.stats.badges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Informations personnelles</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Nom complet</Text><Text style={styles.detailValue}>{firstName} {lastName}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailValue}>{username}@gmail.com</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Téléphone</Text><Text style={styles.detailValue}>0669734700</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Localisation</Text><Text style={styles.detailValue}>Paris, Île de France</Text></View>
      </View>

      <View style={styles.actionsColumn}>
        <Pressable style={styles.saveBtnFull} onPress={handleSave}>
          <Text style={styles.saveText}>Enregistrer</Text>
        </Pressable>
        <Pressable style={styles.outBtnFull} onPress={() => Alert.alert('Déconnexion', 'Mock logout effectué')}>
          <Text style={styles.outText}>Se déconnecter</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 20, fontFamily: typography.fontFamily.bold, color: colors.primary, textAlign: 'center' },
  card: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: { marginRight: 16 },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 28, fontFamily: typography.fontFamily.bold },
  avatarImage: { width: 92, height: 92, borderRadius: 46 },
  info: { flex: 1 },
  nameInput: { fontSize: 18, paddingVertical: 4, color: '#111' },
  username: { color: '#666', marginVertical: 4 },
  bioInput: { color: '#444', marginTop: 8, paddingVertical: 6 },
  statsRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontFamily: typography.fontFamily.bold, color: colors.primary },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  actionsRow: { flexDirection: 'row', marginTop: 14, gap: 12 },
  saveBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  saveText: { color: '#fff', fontFamily: typography.fontFamily.medium },
  outBtn: { borderColor: '#ddd', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  outText: { color: '#333', fontFamily: typography.fontFamily.medium },
  statCentered: { alignItems: 'center', flex: 1 },
  detailsCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  detailsTitle: { fontSize: 16, fontFamily: typography.fontFamily.bold, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomColor: '#f0f0f0', borderBottomWidth: 1 },
  detailLabel: { color: '#666', fontSize: 14 },
  detailValue: { color: '#111', fontSize: 14, fontFamily: typography.fontFamily.medium },
  modifyBtn: { marginTop: 12, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modifyText: { color: '#fff', fontFamily: typography.fontFamily.medium },
  centerProfile: { alignItems: 'center', paddingVertical: 18 },
  nameLargeInput: { fontSize: 22, paddingVertical: 6, color: '#111' },
  bioText: { color: '#444', marginTop: 8, textAlign: 'center', paddingHorizontal: 24 },
  statsRowCentered: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between', paddingHorizontal: 24 },
  actionsColumn: { paddingHorizontal: 16, paddingBottom: 32, marginTop: 12 },
  saveBtnFull: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  outBtnFull: { borderColor: '#ddd', borderWidth: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
});
