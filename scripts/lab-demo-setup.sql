-- Lab Demo Setup — Real CDC replication with live data
-- Run: supabase db query --linked --file scripts/lab-demo-setup.sql

-- Create demo source tables
CREATE TABLE IF NOT EXISTS lab_customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  company VARCHAR(255),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES lab_customers(id),
  product VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create demo target tables
CREATE TABLE IF NOT EXISTS lab_customers_analytics (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  country VARCHAR(100),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  last_order_at TIMESTAMP,
  synced_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_orders_analytics (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(10),
  status VARCHAR(50),
  created_at TIMESTAMP,
  synced_at TIMESTAMP DEFAULT NOW()
);

-- Seed source data
INSERT INTO lab_customers (name, email, company, country) VALUES
  ('Alice Johnson', 'alice@acme.com', 'Acme Corp', 'US'),
  ('Bob Smith', 'bob@globex.com', 'Globex Inc', 'UK'),
  ('Charlie Brown', 'charlie@initech.com', 'Initech', 'DE'),
  ('Diana Prince', 'diana@wayne.com', 'Wayne Enterprises', 'US'),
  ('Eve Davis', 'eve@stark.com', 'Stark Industries', 'JP')
ON CONFLICT (email) DO NOTHING;

INSERT INTO lab_products (name, category, price) VALUES
  ('Enterprise License', 'Software', 4999.00),
  ('Pro License', 'Software', 999.00),
  ('API Access', 'Service', 499.00),
  ('Custom Connector', 'Service', 5000.00),
  ('Support Package', 'Service', 1999.00)
ON CONFLICT DO NOTHING;

INSERT INTO lab_orders (customer_id, product, amount, currency, status) VALUES
  (1, 'Enterprise License', 4999.00, 'USD', 'completed'),
  (2, 'Pro License', 999.00, 'USD', 'completed'),
  (3, 'API Access', 499.00, 'EUR', 'pending'),
  (4, 'Custom Connector', 5000.00, 'USD', 'in_progress'),
  (5, 'Support Package', 1999.00, 'JPY', 'completed')
ON CONFLICT DO NOTHING;

-- Enable CDC on source tables
SELECT enable_cdc_on_table('lab_customers');
SELECT enable_cdc_on_table('lab_orders');
SELECT enable_cdc_on_table('lab_products');

-- Create pipeline for lab demo
INSERT INTO pipelines (id, name, source, target, tables, config, status)
VALUES (
  'lab-demo-pipeline',
  'Lab Demo — Real-Time Analytics',
  '{"engine":"postgresql","database":"pulsyn"}'::jsonb,
  '{"engine":"postgresql","database":"pulsyn"}'::jsonb,
  '["lab_customers", "lab_orders", "lab_products"]'::jsonb,
  '{"tableMapping":{"lab_customers":"lab_customers_analytics","lab_orders":"lab_orders_analytics","lab_products":"lab_products"},"template":"lab-demo"}'::jsonb,
  'running'
) ON CONFLICT (id) DO UPDATE SET status = 'running', updated_at = NOW();

-- Create CDC engine record
INSERT INTO cdc_engines (id, pipeline_id, status, started_at)
VALUES ('engine-lab-demo', 'lab-demo-pipeline', 'running', NOW())
ON CONFLICT (id) DO UPDATE SET status = 'running', started_at = NOW(), updated_at = NOW();

-- Process any pending changes
SELECT * FROM process_pulsyn_changes();

NOTIFY pgrst, 'reload schema';
