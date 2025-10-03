-- Configurar charset de la base de datos
ALTER DATABASE reviews_db CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;
USE reviews_db;
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
    constraint `fk_user_review`foreign key (`user_id`) references users(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

alter table `reviews` convert to character set utf8mb4 collate utf8mb4_spanish2_ci;
alter table `users` convert to character set utf8mb4 collate utf8mb4_spanish2_ci;   

INSERT INTO users (id, user_name) VALUES
('01991c0e-16f0-707f-9f6f-3614666caead', 'José Hernández'),('01991c11-412e-7569-bb85-a4f77ba08bb7','Maria Lopez');

INSERT INTO reviews (product_id, user_id, qualification, comment) VALUES
(1, '01991c0e-16f0-707f-9f6f-3614666caead', 4.5, 'Excelente producto, muy satisfecho con la compra.'),
(1, '01991c11-412e-7569-bb85-a4f77ba08bb7', 3.0, 'El producto es bueno pero el envío fue lento.');
