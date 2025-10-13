-- Configurar charset de la base de datos
ALTER DATABASE reviews_db CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;
USE reviews_db;
-- =====================================================
-- TABLA: products (catálogo local)
-- Catálogo interno de productos para respuestas completas sin depender de product-service
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descuento INT DEFAULT 0,
    marca VARCHAR(255),
    modelo VARCHAR(255),
    imagen VARCHAR(512),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Catálogo local de productos';

-- Productos base
INSERT INTO products (nombre, precio, descuento, marca, modelo, imagen, stock) VALUES
('HP Intel Core I3 - 8GB', 3299000.00, 54, 'HP', '15-fd0026la', '198122843657-001-750Wx750H.webp', 100),
('ASUS Vivobook Intel Core I5 - 16GB', 3799000.00, 0, 'ASUS', 'X1605VA-MB1193W', '4711387799109-001-750Wx750H.webp', 80),
('ASUS Vivobook AMD R7 - 16GB', 4699000.00, 48, 'ASUS', 'M1405YA-LY293W', '4711636049719-003-750Wx750H.webp', 60);
-- Crear tabla de usuarios 

CREATE TABLE `users` (
    `id` VARCHAR(100) NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`)
);

-- Tabla de calificaciones/reseñas
CREATE TABLE `reviews` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `product_id` INT NOT NULL,
    `user_id` VARCHAR(100) NOT NULL,
    `qualification` DECIMAL(2,1) NOT NULL CHECK (`qualification` >= 0 AND `qualification` <= 5),
    `comment` TEXT NOT NULL,
    `review_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_review_date` (`review_date`),
    INDEX `idx_qualification` (`qualification`),
    constraint `fk_user_review` foreign key (`user_id`) references users(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    constraint `fk_product_review` foreign key (`product_id`) references products(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

alter table `reviews` convert to character set utf8mb4 collate utf8mb4_spanish2_ci;
alter table `users` convert to character set utf8mb4 collate utf8mb4_spanish2_ci;   

INSERT INTO users (id, user_name) VALUES
('01991c0e-16f0-707f-9f6f-3614666caead', 'José Hernández'),('01991c11-412e-7569-bb85-a4f77ba08bb7','Maria Lopez');

INSERT INTO reviews (product_id, user_id, qualification, comment) VALUES
(1, '01991c0e-16f0-707f-9f6f-3614666caead', 4.5, 'Excelente producto, muy satisfecho con la compra.'),
(1, '01991c11-412e-7569-bb85-a4f77ba08bb7', 3.0, 'El producto es bueno pero el envío fue lento.');
