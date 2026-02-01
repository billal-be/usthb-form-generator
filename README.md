# USTHB Form Generator

Un générateur de formulaires intelligent conçu pour l'administration de l'USTHB (Université des Sciences et de la Technologie Houari Boumediene). Cette application permet de créer, gérer et collecter des réponses de formulaires officiels avec l'aide de l'intelligence artificielle.

## ✨ Caractéristiques

- **🤖 Génération de formulaires par IA** - Créez des formulaires en conversant avec un assistant IA
- **🎨 Éditeur de formulaires intuitif** - Interface glisser-déposer pour organiser les questions
- **📋 Modèles prédéfinis** - Catégories de questions pré-configurées (informations personnelles, coordonnées, etc.)
- **👥 Gestion des utilisateurs** - Système d'authentification et gestion des utilisateurs
- **📊 Suivi des réponses** - Collecte et visualisation des réponses des formulaires
- **⏰ Gestion des délais** - Définition de dates limites pour les soumissions
- **🎯 Types de questions multiples** - Questions courtes, longues, choix multiples, cases à cocher, dates, etc.
- **📱 Design responsive** - Interface adaptée à tous les écrans

## 🚀 Technologies utilisées

- **Frontend**: [Next.js 15](https://nextjs.org) avec App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Composants UI**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Formulaires**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **Animations**: [Lottie](https://lottiefiles.com/)
- **Backend Proxy**: [Express](https://expressjs.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📋 Prérequis

- [Node.js](https://nodejs.org/) version 20 ou supérieure
- npm, yarn, pnpm ou bun comme gestionnaire de paquets

## 🛠️ Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/billal-be/usthb-form-generator.git
   cd usthb-form-generator
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configuration de l'environnement**
   
   Le projet utilise un backend API hébergé sur `https://projuniv-backend.onrender.com` et un service IA sur `https://syyklo.pythonanywhere.com`.
   
   Pour le développement local, aucune configuration supplémentaire n'est requise.

## 🏃 Démarrage

### Mode Développement

Lancer le serveur de développement Next.js :

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

### Serveur Proxy (Optionnel)

Pour contourner les problèmes CORS en développement, démarrer le serveur proxy :

```bash
node proxy.js
```

Le proxy sera accessible sur [http://localhost:4000](http://localhost:4000).

### Mode Production

1. **Build du projet**
   ```bash
   npm run build
   ```

2. **Démarrer le serveur de production**
   ```bash
   npm start
   ```

## 📖 Utilisation

### Page d'accueil
- Accédez à l'application et cliquez sur "Commencer"
- Connectez-vous avec vos identifiants

### Tableau de bord administrateur

L'interface administrateur comprend 4 sections principales :

1. **Tous les formulaires** - Voir et gérer tous les formulaires créés
2. **Créer un formulaire** - Créer un nouveau formulaire avec :
   - L'assistant IA conversationnel
   - Les modèles de catégories prédéfinis
   - L'éditeur manuel
3. **Tous les utilisateurs** - Gérer les comptes utilisateurs
4. **Créer un utilisateur** - Ajouter de nouveaux utilisateurs

### Création de formulaire

**Méthode 1 : Avec l'IA**
1. Cliquez sur l'icône de chat IA
2. Décrivez le formulaire que vous souhaitez créer
3. L'IA génère automatiquement les questions
4. Modifiez et personnalisez si nécessaire

**Méthode 2 : Avec les modèles**
1. Cliquez sur "Ajouter une catégorie"
2. Sélectionnez parmi les catégories prédéfinies
3. Personnalisez les questions selon vos besoins

**Méthode 3 : Création manuelle**
1. Ajoutez une catégorie personnalisée
2. Ajoutez des questions une par une
3. Configurez le type de question et les options

### Partage de formulaire

Une fois le formulaire créé :
1. Définissez une date limite (optionnelle)
2. Obtenez le lien unique du formulaire
3. Partagez le lien avec les utilisateurs

## 🏗️ Structure du projet

```
usthb-form-generator/
├── public/              # Fichiers statiques
│   ├── animations/      # Animations Lottie
│   └── logo.png        # Logo de l'application
├── src/
│   ├── app/            # Pages et routes Next.js
│   │   ├── admin/      # Interface administrateur
│   │   ├── form/       # Affichage et soumission de formulaires
│   │   ├── home/       # Page d'accueil utilisateur
│   │   └── login/      # Page de connexion
│   ├── components/     # Composants React
│   │   ├── ui/         # Composants UI (shadcn/ui)
│   │   ├── AIChatDialog.tsx
│   │   ├── CategorySelectionDialog.tsx
│   │   └── ...
│   └── lib/            # Utilitaires et helpers
├── proxy.js            # Serveur proxy Express
├── package.json        # Dépendances du projet
└── tsconfig.json       # Configuration TypeScript
```

## 🧪 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement avec Turbopack
- `npm run build` - Crée une version de production
- `npm start` - Démarre le serveur de production
- `npm run lint` - Exécute ESLint pour vérifier le code

## 🔌 API Backend

L'application communique avec deux services backend :

1. **API Principale** : `https://projuniv-backend.onrender.com`
   - Authentification des utilisateurs
   - CRUD des formulaires
   - Gestion des réponses
   - Gestion des utilisateurs

2. **Service IA** : `https://syyklo.pythonanywhere.com`
   - `/chat` - Conversation avec l'assistant IA
   - `/generate` - Génération de formulaires

## 🎨 Personnalisation

Le projet utilise Tailwind CSS pour le styling. Les configurations se trouvent dans :
- `tailwind.config.js` - Configuration Tailwind
- `src/app/globals.css` - Styles globaux
- `components.json` - Configuration shadcn/ui

## 📱 Compatibilité

- ✅ Chrome (dernière version)
- ✅ Firefox (dernière version)
- ✅ Safari (dernière version)
- ✅ Edge (dernière version)
- ✅ Mobile (iOS/Android)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence ISC.

## 👥 Auteurs

Développé pour l'administration de l'USTHB (Université des Sciences et de la Technologie Houari Boumediene).

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 🔗 Liens utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation React](https://react.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Note**: Ce projet utilise Turbopack pour un développement plus rapide. Pour en savoir plus, consultez la [documentation Turbopack](https://turbo.build/pack).
