#!/bin/sh
# Pulsyn CDC Docker Entrypoint

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Pulsyn CDC Engine Starting                    ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Wait for source database
echo "Waiting for source database..."
until node -e "
const { Client } = require('pg');
const c = new Client({
    host: process.env.SOURCE_HOST,
    port: process.env.SOURCE_PORT,
    database: process.env.SOURCE_DB,
    user: process.env.SOURCE_USER,
    password: process.env.SOURCE_PASSWORD
});
c.connect()
    .then(() => { console.log('Source ready'); c.end(); process.exit(0); })
    .catch(() => process.exit(1));
" 2>/dev/null; do
    sleep 2
done

# Wait for target database
echo "Waiting for target database..."
until node -e "
const { Client } = require('pg');
const c = new Client({
    host: process.env.TARGET_HOST,
    port: process.env.TARGET_PORT,
    database: process.env.TARGET_DB,
    user: process.env.TARGET_USER,
    password: process.env.TARGET_PASSWORD
});
c.connect()
    .then(() => { console.log('Target ready'); c.end(); process.exit(0); })
    .catch(() => process.exit(1));
" 2>/dev/null; do
    sleep 2
done

echo "Starting CDC replication..."

# Run CDC engine
exec node packages/cli/dist/index.js replicate pg2pg \
    --source-host "$SOURCE_HOST" \
    --source-port "$SOURCE_PORT" \
    --source-db "$SOURCE_DB" \
    --source-user "$SOURCE_USER" \
    --source-password "$SOURCE_PASSWORD" \
    --target-host "$TARGET_HOST" \
    --target-port "$TARGET_PORT" \
    --target-db "$TARGET_DB" \
    --target-user "$TARGET_USER" \
    --target-password "$TARGET_PASSWORD" \
    --plugin wal2json \
    --batch-size 100
