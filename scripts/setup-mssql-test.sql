-- MSSQL Test Setup Script
-- Creates test tables for mssql connector certification

USE master;
GO

-- Create test schema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dbo')
    EXEC('CREATE SCHEMA dbo');
GO

-- Create users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.users (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255),
        created_at DATETIME2 DEFAULT GETDATE()
    );
    
    INSERT INTO dbo.users (name, email) VALUES
        ('Alice', 'alice@example.com'),
        ('Bob', 'bob@example.com'),
        ('Charlie', 'charlie@example.com');
END
GO

-- Create products table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.products (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(200) NOT NULL,
        price DECIMAL(10,2),
        category NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE()
    );
    
    INSERT INTO dbo.products (name, price, category) VALUES
        ('Widget A', 19.99, 'Electronics'),
        ('Widget B', 29.99, 'Electronics'),
        ('Gadget X', 49.99, 'Gadgets');
END
GO

-- Create orders table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.orders (
        id INT PRIMARY KEY IDENTITY(1,1),
        user_id INT,
        product_id INT,
        quantity INT,
        total DECIMAL(10,2),
        order_date DATETIME2 DEFAULT GETDATE()
    );
    
    INSERT INTO dbo.orders (user_id, product_id, quantity, total) VALUES
        (1, 1, 2, 39.98),
        (2, 2, 1, 29.99),
        (3, 3, 3, 149.97);
END
GO

PRINT 'MSSQL test tables created successfully';
GO
