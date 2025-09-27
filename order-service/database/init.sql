-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS bytestore_orders;
USE bytestore_orders;

-- Tabla principal de órdenes
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estimated_delivery DATE NULL,
    actual_delivery DATE NULL,
    tracking_number VARCHAR(100) NULL,
    notes TEXT NULL,
    
    -- Dirección de envío
    shipping_first_name VARCHAR(100) NOT NULL,
    shipping_last_name VARCHAR(100) NOT NULL,
    shipping_company VARCHAR(100) NULL,
    shipping_address1 VARCHAR(255) NOT NULL,
    shipping_address2 VARCHAR(255) NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    shipping_phone VARCHAR(20) NULL,
    
    -- Dirección de facturación
    billing_first_name VARCHAR(100) NOT NULL,
    billing_last_name VARCHAR(100) NOT NULL,
    billing_company VARCHAR(100) NULL,
    billing_address1 VARCHAR(255) NOT NULL,
    billing_address2 VARCHAR(255) NULL,
    billing_city VARCHAR(100) NOT NULL,
    billing_state VARCHAR(100) NOT NULL,
    billing_postal_code VARCHAR(20) NOT NULL,
    billing_country VARCHAR(100) NOT NULL,
    billing_phone VARCHAR(20) NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_payment_status (payment_status)
);

-- Tabla de items de órdenes
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    product_image VARCHAR(500) NULL,
    specifications JSON NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Tabla de historial de estados de órdenes (para auditoría)
CREATE TABLE IF NOT EXISTS order_status_history (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    previous_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded') NULL,
    new_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded') NOT NULL,
    changed_by VARCHAR(36) NULL, -- user_id o admin_id
    change_reason TEXT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_changed_at (changed_at)
);

-- Insertar datos de ejemplo para testing
INSERT INTO orders (
    id, user_id, order_number, status, total_amount, subtotal, tax, shipping_cost,
    payment_method, payment_status, order_date,
    shipping_first_name, shipping_last_name, shipping_address1, shipping_city, 
    shipping_state, shipping_postal_code, shipping_country,
    billing_first_name, billing_last_name, billing_address1, billing_city,
    billing_state, billing_postal_code, billing_country
) VALUES 
(
    'order-001', 'user-123', 'ORD-2024-001', 'delivered', 1299.99, 1199.99, 120.00, 79.99,
    'credit_card', 'paid', '2024-01-15 10:30:00',
    'Juan', 'Pérez', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', '110111', 'Colombia',
    'Juan', 'Pérez', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', '110111', 'Colombia'
),
(
    'order-002', 'user-123', 'ORD-2024-002', 'shipped', 899.99, 849.99, 85.00, 50.00,
    'debit_card', 'paid', '2024-02-20 14:15:00',
    'Juan', 'Pérez', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', '110111', 'Colombia',
    'Juan', 'Pérez', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', '110111', 'Colombia'
),
(
    'order-003', 'user-456', 'ORD-2024-003', 'processing', 2199.99, 1999.99, 200.00, 99.99,
    'paypal', 'paid', '2024-03-10 09:45:00',
    'María', 'González', 'Carrera 15 #30-25', 'Medellín', 'Antioquia', '050001', 'Colombia',
    'María', 'González', 'Carrera 15 #30-25', 'Medellín', 'Antioquia', '050001', 'Colombia'
);

INSERT INTO order_items (
    id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price
) VALUES 
('item-001', 'order-001', 'prod-001', 'HP Intel Core i5 - 8GB RAM - 256GB SSD', 'HP-I5-8GB-256', 1, 1199.99, 1199.99),
('item-002', 'order-002', 'prod-002', 'Lenovo AMD R5 - 16GB RAM - 512GB SSD', 'LEN-R5-16GB-512', 1, 849.99, 849.99),
('item-003', 'order-003', 'prod-003', 'ASUS Intel Core i7 - 16GB RAM - 1TB SSD', 'ASUS-I7-16GB-1TB', 1, 1999.99, 1999.99);

INSERT INTO order_status_history (
    id, order_id, previous_status, new_status, changed_by, change_reason
) VALUES 
('hist-001', 'order-001', 'shipped', 'delivered', 'system', 'Entregado exitosamente'),
('hist-002', 'order-002', 'processing', 'shipped', 'admin-001', 'Enviado por courier'),
('hist-003', 'order-003', 'confirmed', 'processing', 'system', 'Iniciando procesamiento');