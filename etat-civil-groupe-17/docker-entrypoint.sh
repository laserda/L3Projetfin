#!/bin/sh
set -e

echo "📦 Prisma: Applying migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "🚀 Lancement de Next.js"
exec npm run start
