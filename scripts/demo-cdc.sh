#!/bin/bash
# Pulsyn CDC Demo — Quick Start
# This script sets up a local test environment and runs CDC replication

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Pulsyn CDC Demo — Quick Start                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Install it first:"
    echo "   brew install postgresql@16  (macOS)"
    echo "   apt install postgresql      (Ubuntu)"
    echo "   choco install postgresql    (Windows)"
    exit 1
fi

# Check for Docker (optional, for containerized demo)
if command -v docker &> /dev/null; then
    echo "✅ Docker found — can run containerized demo"
else
    echo "⚠️  Docker not found — using local PostgreSQL"
fi

echo
echo "Step 1: Setting up test databases..."
echo "────────────────────────────────────"

# Create source database
createdb pulsyn_source 2>/dev/null || echo "  Source database already exists"
createdb pulsyn_target 2>/dev/null || echo "  Target database already exists"

# Enable logical replication
psql pulsyn_source -c "ALTER SYSTEM SET wal_level = 'logical';" 2>/dev/null || true

echo
echo "Step 2: Creating test table..."
echo "────────────────────────────────────"

# Create test table in source
psql pulsyn_source << 'EOF'
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert sample data
INSERT INTO users (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Charlie Brown', 'charlie@example.com')
ON CONFLICT DO NOTHING;
EOF

# Create same table in target
psql pulsyn_target << 'EOF'
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
EOF

echo "✅ Test tables created"

echo
echo "Step 3: Checking wal_level..."
echo "────────────────────────────────────"

WAL_LEVEL=$(psql pulsyn_source -t -c "SHOW wal_level" | xargs)
if [ "$WAL_LEVEL" != "logical" ]; then
    echo "⚠️  wal_level is '$WAL_LEVEL', need 'logical'"
    echo "   Run: ALTER SYSTEM SET wal_level = 'logical';"
    echo "   Then restart PostgreSQL"
    echo
    echo "   On macOS with Homebrew:"
    echo "   brew services restart postgresql@16"
    echo
    echo "   On Ubuntu:"
    echo "   sudo systemctl restart postgresql"
    exit 1
fi

echo "✅ wal_level is 'logical'"

echo
echo "Step 4: Running CDC replication..."
echo "────────────────────────────────────"

# Build the project
cd "$(dirname "$0")/.."
npm run build --workspace=@pulsyn/core 2>/dev/null || true

# Run replication
echo "Starting CDC replication (press Ctrl+C to stop)..."
echo
npx pulsyn replicate pg2pg \
    --source-host localhost \
    --source-port 5432 \
    --source-db pulsyn_source \
    --source-user postgres \
    --source-password postgres \
    --target-host localhost \
    --target-port 5432 \
    --target-db pulsyn_target \
    --target-user postgres \
    --target-password postgres \
    --plugin wal2json \
    --batch-size 100

echo
echo "Step 5: Testing replication..."
echo "────────────────────────────────────"

# Insert more data while replication is running
psql pulsyn_source << 'EOF'
INSERT INTO users (name, email) VALUES
    ('Diana Prince', 'diana@example.com'),
    ('Eve Wilson', 'eve@example.com')
ON CONFLICT DO NOTHING;

UPDATE users SET name = 'Alice Johnson-Updated' WHERE email = 'alice@example.com';

DELETE FROM users WHERE email = 'charlie@example.com';
EOF

sleep 2

# Check target
echo "Source rows:"
psql pulsyn_source -c "SELECT count(*) FROM users"
echo
echo "Target rows:"
psql pulsyn_target -c "SELECT count(*) FROM users"

echo
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Demo Complete!                          ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Source: pulsyn_source (localhost:5432)                    ║"
echo "║  Target: pulsyn_target (localhost:5432)                    ║"
echo "║                                                            ║"
echo "║  Try:                                                      ║"
echo "║    psql pulsyn_source -c \"INSERT INTO users (name, email)  ║"
echo "║      VALUES ('Test User', 'test@example.com')\"             ║"
echo "║                                                            ║"
echo "║    psql pulsyn_target -c \"SELECT * FROM users\"             ║"
echo "╚════════════════════════════════════════════════════════════╝"
