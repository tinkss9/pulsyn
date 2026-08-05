-- Pulsyn CDC Demo — Source Database Setup
-- This script initializes the source database for CDC replication

-- Enable logical replication (already done via docker command, but just in case)
-- ALTER SYSTEM SET wal_level = 'logical';

-- Create test tables
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
    user_id INTEGER REFERENCES users(id),
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert sample data
INSERT INTO users (name, email, age, city) VALUES
    ('Alice Johnson', 'alice@example.com', 28, 'New York'),
    ('Bob Smith', 'bob@example.com', 35, 'San Francisco'),
    ('Charlie Brown', 'charlie@example.com', 42, 'Chicago'),
    ('Diana Prince', 'diana@example.com', 31, 'Seattle'),
    ('Eve Wilson', 'eve@example.com', 26, 'Austin')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, price, stock) VALUES
    ('Widget A', 29.99, 100),
    ('Widget B', 49.99, 50),
    ('Widget C', 99.99, 25),
    ('Gadget X', 199.99, 10),
    ('Gadget Y', 299.99, 5)
ON CONFLICT DO NOTHING;

INSERT INTO orders (user_id, product, amount, status) VALUES
    (1, 'Widget A', 29.99, 'completed'),
    (2, 'Widget B', 49.99, 'completed'),
    (3, 'Gadget X', 199.99, 'pending'),
    (1, 'Widget C', 99.99, 'shipped'),
    (4, 'Gadget Y', 299.99, 'pending')
ON CONFLICT DO NOTHING;

-- Create publication for CDC
CREATE PUBLICATION pulsyn_publication FOR TABLE users, orders, products;

-- Create replication slot
SELECT pg_create_logical_replication_slot('pulsyn_slot', 'wal2json');

-- Display setup info
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Pulsyn CDC Source Database Ready!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables: users, orders, products';
    RAISE NOTICE 'Replication slot: pulsyn_slot';
    RAISE NOTICE 'Publication: pulsyn_publication';
    RAISE NOTICE '========================================';
END $$;
