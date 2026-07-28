#!/bin/bash
set -euo pipefail

SEED_DONE="/civic-state/.civictrack_seeded"

echo "[civic-backend] Running migrations..."
npx typeorm-ts-node-commonjs -d src/database/data-source.ts migration:run

echo "[civic-backend] Seed check..."

if [ ! -f "${SEED_DONE}" ]; then
    echo "               Running seed..."
    npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts \
        && touch "${SEED_DONE}" \
        && echo "               Done." \
        || echo "               Seed failed — starting anyway."
else
    echo "               Already seeded. (docker compose down -v to reseed)"
fi

echo "[civic-backend] Starting NestJS on port ${PORT:-3001}..."
exec node dist/main
