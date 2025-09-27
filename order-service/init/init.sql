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
    product_sku VARCHAR(100) NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    product_image_url VARCHAR(500) NULL,
    product_attributes JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Tabla de historial de estados de órdenes
CREATE TABLE IF NOT EXISTS order_status_history (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded') NOT NULL,
    changed_by VARCHAR(36) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_changed_at (changed_at)
);

-- Tabla de cupones aplicados
CREATE TABLE IF NOT EXISTS order_coupons (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    coupon_code VARCHAR(50) NOT NULL,
    coupon_type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_coupon_code (coupon_code)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS order_payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(50) NULL,
    transaction_id VARCHAR(100) NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    gateway_response JSON NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status)
);

-- Insertar datos de ejemplo
INSERT IGNORE INTO orders (
    id, user_id, order_number, status, total_amount, subtotal, tax, shipping_cost,
    payment_method, payment_status, order_date,
    shipping_first_name, shipping_last_name, shipping_address1, shipping_city, 
    shipping_state, shipping_postal_code, shipping_country,
    billing_first_name, billing_last_name, billing_address1, billing_city,
    billing_state, billing_postal_code, billing_country
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'user123', 'ORD-2024-001', 'delivered', 299.99, 249.99, 25.00, 25.00,
 'credit_card', 'paid', '2024-01-15 10:30:00',
 'Juan', 'Pérez', 'Calle Principal 123', 'Madrid', 'Madrid', '28001', 'España',
 'Juan', 'Pérez', 'Calle Principal 123', 'Madrid', 'Madrid', '28001', 'España'),
 
('550e8400-e29b-41d4-a716-446655440002', 'user123', 'ORD-2024-002', 'processing', 159.99, 139.99, 14.00, 6.00,
 'paypal', 'paid', '2024-02-20 14:45:00',
 'Juan', 'Pérez', 'Calle Principal 123', 'Madrid', 'Madrid', '28001', 'España',
 'Juan', 'Pérez', 'Calle Principal 123', 'Madrid', 'Madrid', '28001', 'España');

INSERT IGNORE INTO order_items (
    id, order_id, product_id, product_name, quantity, unit_price, total_price
) VALUES 
('item-001', '550e8400-e29b-41d4-a716-446655440001', 'prod-001', 'Laptop Gaming', 1, 249.99, 249.99),
('item-002', '550e8400-e29b-41d4-a716-446655440002', 'prod-002', 'Mouse Inalámbrico', 2, 69.99, 139.98);