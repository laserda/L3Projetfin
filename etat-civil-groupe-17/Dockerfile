FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Copier package.json et lock en premier pour profiter du cache Docker
COPY package*.json ./

# Installer les dépendances (mises en cache tant que package*.json ne change pas)
RUN npm ci

# Copier le code source complet (inclut le dossier prisma)
COPY . .

# Variables publiques injectées dans le bundle au moment du build
ARG NEXT_PUBLIC_KEY
ENV NEXT_PUBLIC_KEY=$NEXT_PUBLIC_KEY

# Générer le client Prisma et compiler Next.js une seule fois, à la construction de l'image
RUN npx prisma generate --schema=./prisma/schema.prisma \
    && NODE_OPTIONS=--max-old-space-size=1536 npm run build

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
