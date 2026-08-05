-- Pulsyn CDC Demo — Target Database Setup
-- This script initializes the target database for CDC replication

-- Create target tables (same structure as source)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER,
    city VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    product VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create metadata table for tracking replication
CREATE TABLE IF NOT EXISTS _pulsyn_checkpoints (
    id SERIAL PRIMARY KEY,
    pipeline_id VARCHAR(255) NOT NULL,
    lsn VARCHAR(50) NOT NULL,
    events_processed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Display setup info
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Pulsyn CDC Target Database Ready!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables: users, orders, products';
    RAISE NOTICE 'Metadata: _pulsyn_checkpoints';
    RAISE NOTICE '========================================';
END $$;
