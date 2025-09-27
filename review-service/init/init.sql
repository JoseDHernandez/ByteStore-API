-- Script de inicialización para la base de datos de reviews
-- ByteStore Review Service Database

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS bytestore_reviews;
USE bytestore_reviews;

-- Crear tabla de reviews
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    productId VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimizar consultas
    INDEX idx_user_id (userId),
    INDEX idx_product_id (productId),
    INDEX idx_rating (rating),
    INDEX idx_created_at (createdAt),
    
    -- Índice único para evitar reviews duplicadas del mismo usuario para el mismo producto
    UNIQUE KEY unique_user_product (userId, productId)
);

-- Insertar datos de ejemplo
INSERT INTO reviews (id, userId, productId, rating, comment) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'user-001', 'product-001', 5, 'Excelente producto, muy recomendado. La calidad es excepcional.'),
('550e8400-e29b-41d4-a716-446655440002', 'user-002', 'product-001', 4, 'Buen producto, cumple con las expectativas.'),
('550e8400-e29b-41d4-a716-446655440003', 'user-003', 'product-002', 3, 'Producto regular, podría mejorar en algunos aspectos.'),
('550e8400-e29b-41d4-a716-446655440004', 'user-001', 'product-003', 5, 'Perfecto, exactamente lo que buscaba.'),
('550e8400-e29b-41d4-a716-446655440005', 'user-004', 'product-001', 4, 'Muy buena relación calidad-precio.'),
('550e8400-e29b-41d4-a716-446655440006', 'user-005', 'product-002', 2, 'No cumplió mis expectativas, esperaba más.'),
('550e8400-e29b-41d4-a716-446655440007', 'user-002', 'product-004', 5, 'Increíble producto, superó mis expectativas.'),
('550e8400-e29b-41d4-a716-446655440008', 'user-006', 'product-003', 4, 'Buena compra, lo recomiendo.'),
('550e8400-e29b-41d4-a716-446655440009', 'user-007', 'product-005', 3, 'Está bien, pero hay mejores opciones.'),
('550e8400-e29b-41d4-a716-446655440010', 'user-003', 'product-004', 5, 'Excelente calidad y servicio.');

-- Crear vista para estadísticas de productos
CREATE VIEW product_review_stats AS
SELECT 
    productId,
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating,
    MIN(rating) as min_rating,
    MAX(rating) as max_rating,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star_count,
    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star_count,
    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star_count,
    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star_count
FROM reviews 
GROUP BY productId;

-- Crear vista para estadísticas de usuarios
CREATE VIEW user_review_stats AS
SELECT 
    userId,
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating_given,
    MIN(createdAt) as first_review_date,
    MAX(createdAt) as last_review_date
FROM reviews 
GROUP BY userId;

-- Mostrar información de inicialización
SELECT 'ByteStore Reviews Database initialized successfully!' as status;
SELECT COUNT(*) as total_reviews FROM reviews;
SELECT productId, AVG(rating) as avg_rating FROM reviews GROUP BY productId;