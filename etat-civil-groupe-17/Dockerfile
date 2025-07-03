FROM node:22-alpine

WORKDIR /app

# Copier package.json et lock en premier pour le cache Docker
COPY package*.json ./

# Copier le code source complet (inclut le dossier prisma)
COPY . .

# Installer les dépendances (prisma generate est exécuté via postinstall ici)
RUN npm install

# Build de l'application Next.js
RUN npm run build

# Créer le fichier docker-entrypoint.sh directement

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]