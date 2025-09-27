-- Crear base de datos para el servicio de reseñas
CREATE DATABASE IF NOT EXISTS bytestore_reviews;
USE bytestore_reviews;

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    productId VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    
    -- Índices para mejorar el rendimiento
    INDEX idx_product_id (productId),
    INDEX idx_user_id (userId),
    INDEX idx_created_at (createdAt),
    INDEX idx_rating (rating),
    
    -- Índice compuesto para evitar reseñas duplicadas del mismo usuario para el mismo producto
    UNIQUE INDEX idx_user_product (userId, productId)
);

-- Insertar datos de ejemplo (opcional para desarrollo)
INSERT INTO reviews (id, userId, productId, rating, comment, createdAt, updatedAt) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', 5, 'Excelente producto, muy recomendado. La calidad es excepcional y llegó en perfectas condiciones.', '2024-01-15T10:30:00.000Z', '2024-01-15T10:30:00.000Z'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440020', 4, 'Muy buen producto, aunque el envío tardó un poco más de lo esperado. En general satisfecho con la compra.', '2024-01-16T14:20:00.000Z', '2024-01-16T14:20:00.000Z'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440021', 3, 'El producto está bien, cumple con lo prometido pero nada extraordinario. Relación calidad-precio aceptable.', '2024-01-17T09:15:00.000Z', '2024-01-17T09:15:00.000Z'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440021', 5, 'Increíble calidad y servicio al cliente. Definitivamente volvería a comprar. Superó mis expectativas.', '2024-01-18T16:45:00.000Z', '2024-01-18T16:45:00.000Z'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440022', 2, 'No cumplió con mis expectativas. El producto llegó con algunos defectos menores. El servicio de atención podría mejorar.', '2024-01-19T11:30:00.000Z', '2024-01-19T11:30:00.000Z');

-- Crear vista para estadísticas de productos
CREATE VIEW product_review_stats AS
SELECT 
    productId,
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating,
    MIN(rating) as min_rating,
    MAX(rating) as max_rating,
    MIN(createdAt) as first_review_date,
    MAX(createdAt) as last_review_date
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