# Credit Clockwork Planner

Application de gestion des notes et absences.

## Développement

Prérequis : Node.js et npm.

```sh
npm install
npm run dev
```

## Configuration

Créez un fichier `.env` à la racine avec les variables suivantes :

```sh
VITE_API_BASE_URL=/api
```

Les services API sont des placeholders adossés à une base locale (`localStorage`).

## Scripts

```sh
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualisation du build
npm run lint       # Analyse ESLint
npm run test       # Tests Vitest
npm run format     # Formatage Prettier
```
