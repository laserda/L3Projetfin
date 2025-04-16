# Etat Civil API

API d'état civil basée sur NestJS, Prisma et PostgreSQL.

## Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Configurer la base de données dans `.env`
3. Générer le client Prisma et la base :
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Lancer l'API :
   ```bash
   npm run start:dev
   ```

## Structure

- `src/` : Code source (modules, controllers, services, etc.)
- `prisma/` : Modélisation de la base de données
- `.env` : Configuration environnement

## Modules principaux
- Authentification (citoyen, agent, admin)
- Gestion des citoyens, demandes, actes, paiements, historique, statistiques

## Endpoints principaux
Voir la documentation dans le dossier `/docs` ou le code source des controllers.


Executer le projet
npm run start:dev

Generer un secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

npx prisma generate
docker-compose up -d
npx prisma migrate dev --name init
npx prisma db push
