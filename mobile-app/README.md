# 🌿 Nature Explorer – Carnet de découvertes dans la nature

> **Application mobile développée avec React Native (Expo)** permettant de documenter et visualiser ses découvertes dans la nature (plantes, paysages, animaux, etc.) à travers des photos, une carte interactive et un calendrier d’exploration.

---

## 🎯 Objectif du projet

Créer une application mobile simple et intuitive pour :
- Prendre des **photos** via la caméra du téléphone.
- Enregistrer automatiquement la **localisation GPS** et la **date** de chaque observation.
- Visualiser ses découvertes sur une **carte interactive**.
- Parcourir ses explorations via un **calendrier** et une **galerie de photos**.
- Consulter ses **statistiques personnelles** (nombre de photos, lieux visités…).

---

## 🚀 Fonctionnalités à développer

| Fonctionnalité | Description |
|-----------------|-------------|
| 📸 **Caméra** | Prendre une photo et l’enregistrer avec la date et la position GPS. |
| 🌍 **Localisation GPS** | Récupérer automatiquement les coordonnées de l’observation. |
| 🗺️ **Carte interactive** | Afficher toutes les observations sous forme de marqueurs. Cliquer sur un marqueur ouvre la photo correspondante. |
| 🗓️ **Calendrier** | Visualiser les jours où des photos ont été prises et filtrer les photos par date. |
| 🖼️ **Galerie Photos** | Lister toutes les photos avec possibilité de filtrer par date ou par lieu. |
| 👤 **Profil / Statistiques** | Modifier les informations personnelles et consulter un résumé des activités. |

---

## 🧠 Stack technique

- **Framework :** React Native (Expo)
- **Langage :** TypeScript
- **Navigation :** Expo Router + Bottom Tabs
- **Caméra :** `expo-camera`
- **Localisation :** `expo-location`
- **Carte :** `react-native-maps`
- **Calendrier :** `react-native-calendars`
- **Stockage local :** `@react-native-async-storage/async-storage`
- **Gestion d’état :** Hooks React (`useState`, `useEffect`)
- **Style :** `StyleSheet` (React Native)

---

## 🏗️ Structure du projet

NatureExplorer/
│
├── app/
│ ├── (tabs)/
│ │ ├── camera.tsx
│ │ ├── map.tsx
│ │ ├── calendar.tsx
│ │ ├── photos.tsx
│ │ └── profile.tsx
│ ├── _layout.tsx
│ └── index.tsx
│
├── components/
│ ├── PhotoCard.tsx
│ └── StatCard.tsx
│
├── utils/
│ ├── storage.ts
│ └── location.ts
│
├── assets/
│ ├── icon.png
│ ├── logo.png
│ └── splash.png
│
├── App.tsx
└── README.md

---

## ⚙️ Installation et exécution

### 1️⃣ Cloner le dépôt
```bash
git clone https://github.com/<ton-pseudo>/NatureExplorer.git
cd NatureExplorer
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Lancer le projet
```bash
npx expo start
```

📱 Scanne le QR code avec Expo Go pour tester l’application sur ton téléphone
ou lance un émulateur Android/iOS depuis ton terminal.

---

## 🧩 Répartition des tâches (équipe)

| Membre | Rôle | Responsabilités principales |
|--------|------|-----------------------------|
| Jokast Kassa (Chef de projet) | Coordination & intégration | Gestion du repo GitHub, architecture, navigation, carte et calendrier |
| Rufus | Développeur Caméra & GPS | Caméra, capture photo, gestion des métadonnées (date + position), tests techniques |
| Yannick | Développeur Interface & Profil | Design UI/UX, page Profil, galerie de photos et statistiques |

---

## 🧪 Étapes de développement

| Étape | Fonctionnalité | État |
|------:|---------------|:----:|
| 1️⃣ | Initialisation du projet Expo + navigation | ✅ |
| 2️⃣ | Page Caméra + autorisations | 🔄 En cours |
| 3️⃣ | Localisation GPS | 🔜 À faire |
| 4️⃣ | Carte interactive avec marqueurs | 🔜 À faire |
| 5️⃣ | Calendrier des explorations | 🔜 À faire |
| 6️⃣ | Galerie Photos + filtres | 🔜 À faire |
| 7️⃣ | Profil & statistiques | 🔜 À faire |
| 8️⃣ | Tests finaux + soutenance | ⏳ Prévue vendredi |

---

## 🎤 Présentation (Soutenance)

Durée : ~10 minutes

Structure :

- Introduction & objectif du projet – Jokast
- Architecture et choix techniques – Jokast
- Démonstration technique (Caméra, GPS, Carte) – Rufus
- Interface & expérience utilisateur – Yannick
- Difficultés rencontrées et perspectives – Tous

---

## 💚 Auteurs

👨‍💻 Équipe Nature Explorer

Jokast Kassa

Rufus Mouakassa

Yannick Coulibaly

---

## 📜 Licence

Projet pédagogique – IPSSI / Piscine 2025
Tous droits réservés © 2025
