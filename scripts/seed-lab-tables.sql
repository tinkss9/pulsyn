-- Pulsyn Connector Lab Test Tables
-- Run this on any PostgreSQL-compatible database (Supabase, local Postgres, etc.)
-- Usage: psql $DATABASE_URL -f scripts/seed-lab-tables.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS lab_orders CASCADE;
DROP TABLE IF EXISTS lab_products CASCADE;
DROP TABLE IF EXISTS lab_users CASCADE;

-- Create tables
CREATE TABLE lab_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lab_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lab_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES lab_users(id),
  product_id INTEGER REFERENCES lab_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO lab_users (name, email) VALUES
  ('Alice Johnson', 'alice@example.com'),
  ('Bob Smith', 'bob@example.com'),
  ('Charlie Brown', 'charlie@example.com'),
  ('Diana Prince', 'diana@example.com'),
  ('Eve Wilson', 'eve@example.com');

INSERT INTO lab_products (name, price, category, in_stock) VALUES
  ('Widget A', 29.99, 'widgets', true),
  ('Widget B', 49.99, 'widgets', true),
  ('Gadget X', 99.99, 'gadgets', true),
  ('Gadget Y', 149.99, 'gadgets', false),
  ('Thingamajig', 9.99, 'misc', true);

INSERT INTO lab_orders (user_id, product_id, quantity, total, status) VALUES
  (1, 1, 2, 59.98, 'completed'),
  (1, 3, 1, 99.99, 'completed'),
  (2, 2, 1, 49.99, 'pending'),
  (3, 5, 10, 99.90, 'completed'),
  (4, 4, 1, 149.99, 'shipped'),
  (5, 1, 3, 89.97, 'pending');

-- Verify
SELECT 'lab_users' as table_name, COUNT(*) as rows FROM lab_users
UNION ALL
SELECT 'lab_products', COUNT(*) FROM lab_products
UNION ALL
SELECT 'lab_orders', COUNT(*) FROM lab_orders;
