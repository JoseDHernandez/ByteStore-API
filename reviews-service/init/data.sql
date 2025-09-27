-- Configurar charset de la base de datos
ALTER DATABASE reviews CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;

-- Tabla de calificaciones/reseñas
CREATE TABLE `calificaciones` (
    `calificacion_id` INT NOT NULL AUTO_INCREMENT,
    `producto_id` INT NOT NULL,
    `usuario_id` VARCHAR(100) NOT NULL,
    `calificacion` TINYINT NOT NULL CHECK (`calificacion` >= 1 AND `calificacion` <= 5),
    `comentario` TEXT,
    `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`calificacion_id`),
    INDEX `idx_producto_id` (`producto_id`),
    INDEX `idx_usuario_id` (`usuario_id`),
    INDEX `idx_fecha` (`fecha`),
    INDEX `idx_calificacion` (`calificacion`)
);



-- Datos de prueba para calificaciones
INSERT INTO `calificaciones` (`producto_id`, `usuario_id`, `calificacion`, `comentario`, `fecha`) VALUES
(1, '01991c0e-16f0-707f-9f6f-3614666caead', 5, 'Excelente producto, muy buena calidad y rendimiento. Lo recomiendo totalmente.', '2024-01-15 10:30:00'),
(1, '01991c11-412e-7569-bb85-a4f77ba08bb7', 4, 'Buen producto, aunque el precio podría ser mejor. Cumple con las expectativas.', '2024-01-16 14:20:00'),
(2, '01991c0e-16f0-707f-9f6f-3614666caead', 3, 'Producto regular, tiene algunos detalles que mejorar pero funciona bien.', '2024-01-17 09:15:00'),
(3, '01991c11-412e-7569-bb85-a4f77ba08bb7', 5, 'Increíble calidad, superó mis expectativas. Entrega rápida y excelente servicio.', '2024-01-18 16:45:00'),
(4, '01991c0e-16f0-707f-9f6f-3614666caead', 4, 'Muy satisfecho con la compra. Buena relación calidad-precio.', '2024-01-19 11:30:00'),
(5, '01991c11-412e-7569-bb85-a4f77ba08bb7', 2, 'No cumplió con mis expectativas. El producto llegó con algunos defectos.', '2024-01-20 13:25:00'),
(6, '01991c0e-16f0-707f-9f6f-3614666caead', 5, 'Perfecto para mis necesidades. Excelente calidad y muy fácil de usar.', '2024-01-21 15:10:00'),
(7, '01991c11-412e-7569-bb85-a4f77ba08bb7', 4, 'Buen producto en general. El empaque podría mejorar pero el contenido es bueno.', '2024-01-22 08:40:00');