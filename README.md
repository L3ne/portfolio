# Portfolio Next.js

Portfolio personnel avec interface terminal cyberpunk, migré vers Next.js.

## 🚀 Fonctionnalités

- **Interface Terminal Interactive** : Simulation d'un terminal avec commandes personnalisées
- **APIs Intégrées** :
  - Last.fm : Dernière musique écoutée
  - Valorant : Statistiques de jeu
  - Upload d'images : Interface d'upload avec galerie
- **Design Cyberpunk** : Interface futuriste avec effets visuels
- **Responsive** : Adapté mobile et desktop

## 🛠️ Technologies

- **Next.js 15** : Framework React avec SSR/SSG
- **TypeScript** : Typage statique
- **CSS Modules** : Styles modulaires
- **Formidable** : Upload de fichiers
- **APIs Externes** : Last.fm, Valorant

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start
```

## 🌐 URLs Disponibles

- **Page principale** : `http://localhost:3000`
- **API Last.fm** : `http://localhost:3000/api/lastfm`
- **API Valorant** : `http://localhost:3000/api/valorant`
- **Upload d'images** : `http://localhost:3000/api/upload`
- **Galerie** : `http://localhost:3000/api/gallery`

## 🎮 Commandes Terminal

- `help` : Affiche toutes les commandes disponibles
- `aboutme` : Informations personnelles
- `projects` : Projets développés
- `skills` : Compétences techniques
- `contact` : Informations de contact
- `api` : Liens vers les APIs
- `clear` : Efface le terminal
- `reboot` : Redémarre l'interface

## 📁 Structure du Projet

```
portfolio/
├── pages/
│   ├── api/           # API routes Next.js
│   │   ├── lastfm.ts
│   │   ├── valorant.ts
│   │   ├── upload.ts
│   │   ├── gallery.ts
│   │   └── index.ts
│   ├── _app.tsx       # Configuration globale
│   └── index.tsx      # Page principale
├── public/
│   ├── assets/        # Images et assets
│   └── uploads/       # Images uploadées
├── styles/
│   └── globals.css    # Styles globaux
└── next.config.js     # Configuration Next.js
```

## 🔧 Migration Express → Next.js

Cette version a été migrée depuis Express.js vers Next.js pour :

- **Meilleure performance** : SSR/SSG intégrés
- **Développement moderne** : Hot reload, TypeScript
- **Déploiement simplifié** : Vercel, Netlify
- **APIs intégrées** : Plus besoin de serveur séparé
- **SEO optimisé** : Meta tags automatiques

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload du dossier .next
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Notes

- Les clés API sont actuellement en dur dans le code (à déplacer vers les variables d'environnement)
- L'upload d'images est limité à 10MB
- Le terminal supporte l'historique des commandes (flèches haut/bas)
- Interface responsive avec breakpoints mobile/desktop

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
