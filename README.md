# carLink - Application de Location de Véhicules Électriques

## Description
carLink est une application web développée avec Next.js et Mapbox qui permet aux utilisateurs de louer des véhicules électriques. L'application offre une expérience utilisateur intuitive pour la planification d'itinéraires et la réservation de véhicules électriques.

## Fonctionnalités Principales
- **Création d'itinéraires** : Planification de trajets avec Mapbox
- **Gestion des véhicules électriques** : 
  - Affichage des véhicules disponibles
  - Filtrage des véhicules selon différents critères

## Technologies Utilisées
- Next.js
- Mapbox
- Prisma
- TypeScript
- Docker

## Prérequis
- Node.js
- Docker et Docker Compose
- Compte Mapbox (pour la clé API)

## Installation et Configuration

1. **Cloner le projet**
```bash
git clone [URL_DU_REPO]
cd carLink
```

2. **Configurer les variables d'environnement**
Créer un fichier `.env` à la racine du projet avec les variables suivantes :
```
MAPBOX_ACCESS_TOKEN=votre_token_mapbox
DATABASE_URL="postgresql://user:password@localhost:5432/carlink"
```

3. **Démarrer les conteneurs Docker**
```bash
docker-compose up -d
```

4. **Installer les dépendances**
```bash
npm install
```

5. **Initialiser la base de données**
```bash
npx prisma db push
npx ts-node -P tsconfig.seed.json prisma/seed.ts
```

6. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible à l'adresse : http://localhost:3000

## Structure du Projet
- `/app` : Pages et composants Next.js
- `/prisma` : Schéma de base de données et migrations
- `/public` : Assets statiques
- `/styles` : Fichiers CSS

## Contribution
Ce projet a été développé dans le cadre d'un partiel. 
