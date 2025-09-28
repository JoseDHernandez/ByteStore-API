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



-- Datos de prueba para calificaciones usando usuarios y productos reales
INSERT INTO `calificaciones` (`producto_id`, `usuario_id`, `calificacion`, `comentario`, `fecha`) VALUES
-- Reseñas para productos entregados (solo usuarios que compraron y recibieron el producto)

-- Producto 1: HP Intel Core I3 - 8GB (comprado por María)
(1, '01991c11-412e-7569-bb85-a4f77ba08bb7', 4, 'Excelente relación calidad-precio. El portátil funciona muy bien para tareas básicas y el descuento que obtuve lo hizo aún mejor. La batería dura bastante y es perfecto para estudiantes.', '2024-01-16 10:30:00'),

-- Producto 9: ASUS Vivobook Intel Core I5 - 16GB (comprado por Carlos)
(9, 'cliente-002-uuid-7890-123456789012', 5, 'Increíble portátil, superó todas mis expectativas. La pantalla de 16 pulgadas es perfecta para trabajar y la velocidad del procesador i5 es excelente. Lo recomiendo totalmente para profesionales.', '2024-01-20 14:20:00'),

-- Producto 6: ASUS Vivobook AMD R7 - 16GB (comprado por Valentina)
(6, 'cliente-005-uuid-9012-345678901234', 5, 'Perfecto para mis necesidades de diseño gráfico. El procesador AMD Ryzen 7 maneja muy bien los programas pesados y los 16GB de RAM son suficientes. Excelente compra.', '2024-01-24 16:45:00'),

-- Reseñas adicionales de otros usuarios para productos populares (simulando que también los compraron en otras tiendas o momentos)

-- Producto 1: HP Intel Core I3 - Otra reseña
(1, 'cliente-004-uuid-6789-012345678901', 3, 'Buen producto para el precio, aunque esperaba un poco más de rendimiento. Es adecuado para tareas básicas pero se queda corto para programas más exigentes.', '2024-01-17 09:15:00'),

-- Producto 3: HP Intel Core I5 - 16GB (producto popular)
(3, 'cliente-006-uuid-2345-678901234567', 5, 'Excelente portátil, muy buena calidad y rendimiento. La pantalla con microbordes es hermosa y la batería dura todo el día. Perfecto para trabajo y entretenimiento.', '2024-01-18 11:30:00'),
(3, 'cliente-007-uuid-5678-901234567890', 4, 'Muy satisfecho con la compra. Buena relación calidad-precio, aunque el precio podría ser un poco mejor. El rendimiento es sólido y cumple con las expectativas.', '2024-01-19 13:25:00'),

-- Producto 5: ASUS TUF Gaming (producto premium)
(5, 'cliente-008-uuid-8901-234567890123', 5, 'Increíble para gaming! La RTX 3050 maneja todos los juegos actuales sin problemas. El diseño es robusto y la refrigeración funciona perfectamente. Vale cada peso.', '2024-01-21 15:10:00'),
(5, '01991c11-412e-7569-bb85-a4f77ba08bb7', 4, 'Buen portátil gaming, aunque un poco pesado para transportar. El rendimiento en juegos es excelente y la pantalla se ve muy bien. Recomendado para gamers serios.', '2024-01-22 08:40:00'),

-- Producto 2: Lenovo AMD R5 - 24GB (producto con mucha RAM)
(2, 'cliente-003-uuid-3456-789012345678', 4, 'Los 24GB de RAM son una maravilla para multitarea. Puedo tener muchas aplicaciones abiertas sin problemas. El procesador AMD R5 es eficiente y la pantalla WUXGA es nítida.', '2024-01-23 12:15:00'),

-- Producto 4: HP AMD R7 - 16GB
(4, 'cliente-004-uuid-6789-012345678901', 3, 'Producto regular, tiene algunos detalles que mejorar pero funciona bien. El procesador AMD R7 es bueno pero esperaba mejor optimización del sistema. La pantalla es decente.', '2024-01-25 14:30:00'),

-- Producto 8: HP Intel Core I5 - 8GB (producto popular)
(8, 'cliente-005-uuid-9012-345678901234', 4, 'Buen producto en general. El diseño es elegante y la calidad de construcción es sólida. Los 8GB de RAM son suficientes para uso básico pero podrían ser más para multitarea intensa.', '2024-01-26 16:20:00'),

-- Reseña negativa para mostrar variedad
(12, 'cliente-006-uuid-2345-678901234567', 2, 'No cumplió con mis expectativas. El producto llegó con algunos defectos menores y el rendimiento es más lento de lo esperado. El servicio al cliente fue bueno pero el producto necesita mejoras.', '2024-01-27 10:45:00'),

-- Más reseñas para productos con diferentes calificaciones
(10, 'cliente-007-uuid-5678-901234567890', 5, 'Excelente portátil LENOVO, muy buena calidad y el procesador AMD R7 es potente. Perfecto equilibrio entre rendimiento y eficiencia energética. Lo recomiendo ampliamente.', '2024-01-28 09:30:00'),

(11, 'cliente-008-uuid-8901-234567890123', 4, 'El HP Pavilion x360 es versátil y funcional. La pantalla táctil responde bien y la bisagra de 360° es muy útil. Buena opción para estudiantes y profesionales que necesitan flexibilidad.', '2024-01-29 11:15:00'),

(13, '01991c11-412e-7569-bb85-a4f77ba08bb7', 3, 'Producto decente pero nada extraordinario. Los 8GB de RAM se quedan cortos para algunas tareas y el almacenamiento de 1TB es bueno. Precio justo pero hay mejores opciones en el mercado.', '2024-01-30 13:45:00');