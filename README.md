# NatexFront — Nature Explorer (mobile)

Ce dossier contient l'application mobile (Expo + expo-router) pour le projet Nature Explorer.

Structure recommandée

NatureExplorer/
│
├── app/                           # Racine du code applicatif
│   ├── (tabs)/                    # Navigation principale (onglets)
│   │   ├── camera.tsx             # Page Caméra
│   │   ├── map.tsx                # Page Carte
│   │   ├── calendar.tsx           # Page Calendrier
│   │   ├── photos.tsx             # Page Photos
│   │   └── profile.tsx            # Page Profil
│   │
│   ├── _layout.tsx                # Contient la Tab Navigation
│   └── index.tsx                  # (optionnel) page d’accueil ou redirection
│
├── components/                    # Composants réutilisables
│   ├── PhotoCard.tsx
│   └── StatCard.tsx
│
├── utils/                         # Fonctions utiles
│   ├── storage.ts                 # Sauvegarde locale (AsyncStorage)
│   └── location.ts                # Gestion GPS
│
├── assets/                        # Images, icônes, etc.
│   ├── icon.png
│   ├── splash.png
│   └── logo.png
│
├── App.tsx                        # Point d’entrée du projet Expo
├── package.json
└── README.md

Comment démarrer

1) Installer les dépendances

```powershell
cd natexfront
npm install
```

2) Lancer l'app

```powershell
npx expo start
```

Notes
- Ce README remplace le README généré par `create-expo-app` et ajoute la structure recommandée pour l'équipe.
- Les fichiers présents dans `app/(tabs)` sont des placeholders — complétez-les pour implémenter la navigation et les écrans.
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
