#!/bin/sh
set -e
cd /app
export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"
npx prisma db push --skip-generate
COUNT=$(node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.table.count().then(c=>{console.log(c); return p.\$disconnect();}).catch(e=>{console.error(e); process.exit(1);})")
if [ "$COUNT" = "0" ]; then
  echo "Seeding demo data..."
  npx tsx prisma/seed.ts
fi
exec node node_modules/next/dist/bin/next start -p "${PORT:-3000}"
