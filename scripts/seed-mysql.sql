-- Pulsyn MySQL Test Seed Data
-- Creates test tables for connector validation

USE pulsyn_testdb;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    age INT,
    salary DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    stock INT DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload JSON,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO users (email, name, age, salary, is_active) VALUES
    ('alice@example.com', 'Alice Johnson', 32, 85000.00, true),
    ('bob@example.com', 'Bob Smith', 28, 72000.00, true),
    ('charlie@example.com', 'Charlie Brown', 45, 120000.00, true),
    ('diana@example.com', 'Diana Prince', 35, 95000.00, false),
    ('eve@example.com', 'Eve Davis', 29, 68000.00, true);

INSERT INTO products (name, price, category, stock, metadata) VALUES
    ('Laptop Pro', 1299.99, 'Electronics', 50, '{"brand": "TechCo", "warranty": "2yr"}'),
    ('Wireless Mouse', 29.99, 'Electronics', 200, '{"color": "black", "dpi": 1600}'),
    ('Standing Desk', 599.99, 'Furniture', 30, '{"material": "oak", "adjustable": true}'),
    ('Coffee Maker', 89.99, 'Kitchen', 100, '{"capacity": "12 cups", "programmable": true}'),
    ('Monitor 27"', 449.99, 'Electronics', 75, '{"resolution": "4K", "refresh": "144Hz"}');

INSERT INTO orders (user_id, product_id, quantity, total, status) VALUES
    (1, 1, 1, 1299.99, 'completed'),
    (2, 2, 2, 59.98, 'completed'),
    (3, 3, 1, 599.99, 'shipped'),
    (1, 4, 1, 89.99, 'pending'),
    (4, 5, 1, 449.99, 'completed');

INSERT INTO events (event_type, payload, source) VALUES
    ('user.signup', '{"userId": 1, "email": "alice@example.com"}', 'auth-service'),
    ('order.created', '{"orderId": 1, "userId": 1, "total": 1299.99}', 'order-service'),
    ('product.viewed', '{"productId": 2, "userId": 3}', 'analytics'),
    ('user.login', '{"userId": 2, "ip": "192.168.1.1"}', 'auth-service'),
    ('payment.processed', '{"orderId": 2, "amount": 59.98, "method": "card"}', 'payment-service');

-- Enable binary logging for CDC
SET GLOBAL log_bin_trust_function_creators = 1;
