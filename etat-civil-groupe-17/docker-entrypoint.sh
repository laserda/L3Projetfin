#!/bin/sh

# echo "⏳ Attente de la base de données..."
# while ! (echo > /dev/tcp/postgres/5440) >/dev/null 2>&1; do
#   sleep 1
# done


echo "📦 Prisma: Generating client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "📦 Prisma: Applying migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "🚀 Build Next.js..."
npm run build

echo "🚀 Lancement de Next.js"
npm run start
