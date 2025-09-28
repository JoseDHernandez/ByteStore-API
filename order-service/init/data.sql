-- =====================================================
-- SCRIPT DE INICIALIZACIÓN - ORDERS SERVICE
-- Base de datos para gestión de órdenes - ByteStore
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS orders_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE orders_db;

-- =====================================================
-- TABLA: orders (órdenes)
-- Almacena la información principal de cada orden
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    orden_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL COMMENT 'ID del usuario que realizó la orden',
    correo_usuario VARCHAR(300) NOT NULL COMMENT 'Email del usuario',
    direccion TEXT NOT NULL COMMENT 'Dirección de entrega',
    nombre_completo VARCHAR(200) NOT NULL COMMENT 'Nombre completo del cliente',
    estado ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente' COMMENT 'Estado actual de la orden',
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total de la orden',
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del pago',
    fecha_entrega TIMESTAMP NULL COMMENT 'Fecha estimada/real de entrega',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimizar consultas
    INDEX idx_user_id (user_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_pago (fecha_pago),
    INDEX idx_correo_usuario (correo_usuario)
) ENGINE=InnoDB COMMENT='Tabla principal de órdenes';

-- =====================================================
-- TABLA: order_products (productos de la orden)
-- Almacena los productos incluidos en cada orden
-- =====================================================
CREATE TABLE IF NOT EXISTS order_products (
    orden_productos_id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL COMMENT 'ID de la orden (FK)',
    producto_id INT NOT NULL COMMENT 'ID del producto',
    nombre VARCHAR(300) NOT NULL COMMENT 'Nombre del producto al momento de la compra',
    precio DECIMAL(10,2) NOT NULL COMMENT 'Precio del producto al momento de la compra',
    descuento DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Descuento aplicado (porcentaje)',
    marca VARCHAR(100) NOT NULL COMMENT 'Marca del producto',
    modelo VARCHAR(100) NOT NULL COMMENT 'Modelo del producto',
    cantidad INT NOT NULL DEFAULT 1 COMMENT 'Cantidad del producto en la orden',
    imagen TEXT COMMENT 'URL de la imagen del producto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    FOREIGN KEY (orden_id) REFERENCES orders(orden_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Índices para optimizar consultas
    INDEX idx_orden_id (orden_id),
    INDEX idx_producto_id (producto_id),
    INDEX idx_marca (marca),
    
    -- Restricciones
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_descuento_valido CHECK (descuento >= 0 AND descuento <= 100)
) ENGINE=InnoDB COMMENT='Productos incluidos en cada orden';

-- =====================================================
-- TABLA: order_status_history (historial de estados)
-- Almacena el historial de cambios de estado de órdenes
-- =====================================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL COMMENT 'ID de la orden (FK)',
    estado_anterior ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') NOT NULL COMMENT 'Estado anterior de la orden',
    estado_nuevo ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') NOT NULL COMMENT 'Nuevo estado de la orden',
    motivo TEXT COMMENT 'Motivo del cambio de estado',
    changed_by INT NOT NULL COMMENT 'ID del usuario que realizó el cambio',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del cambio',
    
    -- Claves foráneas
    FOREIGN KEY (orden_id) REFERENCES orders(orden_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Índices para optimizar consultas
    INDEX idx_orden_historial (orden_id),
    INDEX idx_fecha_cambio (changed_at),
    INDEX idx_estado_anterior (estado_anterior),
    INDEX idx_estado_nuevo (estado_nuevo)
) ENGINE=InnoDB COMMENT='Historial de cambios de estado de órdenes';

-- =====================================================
-- DATOS DE EJEMPLO PARA TESTING
-- =====================================================

-- Insertar órdenes de ejemplo usando usuarios reales y productos del product-service
INSERT INTO orders (user_id, correo_usuario, direccion, nombre_completo, estado, total, fecha_entrega) VALUES
-- Órdenes entregadas
('01991c11-412e-7569-bb85-a4f77ba08bb7', 'maria.lopez@gmail.com', 'Carrera 45 #23-12, Medellín, Colombia', 'María Fernanda López García', 'entregado', 3134550.00, '2024-01-15 14:30:00'),
('cliente-002-uuid-7890-123456789012', 'carlos.martinez@hotmail.com', 'Avenida 68 #125-30, Cali, Colombia', 'Carlos Eduardo Martínez Silva', 'entregado', 3799000.00, '2024-01-18 16:45:00'),
('cliente-005-uuid-9012-345678901234', 'valentina.torres@gmail.com', 'Calle 85 #47-23, Bogotá, Colombia', 'Valentina Isabel Torres Moreno', 'entregado', 4699000.00, '2024-01-22 11:20:00'),

-- Órdenes enviadas
('cliente-003-uuid-3456-789012345678', 'alejandra.rodriguez@yahoo.com', 'Calle 50 #12-34, Barranquilla, Colombia', 'Alejandra Sofía Rodríguez Peña', 'enviado', 5899000.00, '2024-01-25 10:00:00'),
('cliente-007-uuid-5678-901234567890', 'isabella.herrera@hotmail.com', 'Carrera 11 #93-45, Medellín, Colombia', 'Isabella María Herrera Castro', 'enviado', 4099000.00, '2024-01-26 15:30:00'),

-- Órdenes en procesamiento
('cliente-004-uuid-6789-012345678901', 'diego.gonzalez@outlook.com', 'Carrera 15 #28-45, Bucaramanga, Colombia', 'Diego Andrés González Vargas', 'procesando', 4499000.00, NULL),
('cliente-006-uuid-2345-678901234567', 'sebastian.jimenez@gmail.com', 'Avenida 19 #104-62, Bogotá, Colombia', 'Sebastián Camilo Jiménez Rojas', 'procesando', 3999000.00, NULL),

-- Órdenes pendientes
('cliente-008-uuid-8901-234567890123', 'mateo.vasquez@yahoo.com', 'Calle 127 #15-78, Bogotá, Colombia', 'Mateo Alejandro Vásquez Luna', 'pendiente', 3269000.00, NULL),
('01991c11-412e-7569-bb85-a4f77ba08bb7', 'maria.lopez@gmail.com', 'Carrera 45 #23-12, Medellín, Colombia', 'María Fernanda López García', 'pendiente', 7598000.00, NULL),

-- Órdenes canceladas
('cliente-002-uuid-7890-123456789012', 'carlos.martinez@hotmail.com', 'Avenida 68 #125-30, Cali, Colombia', 'Carlos Eduardo Martínez Silva', 'cancelado', 0.00, NULL),
('cliente-003-uuid-3456-789012345678', 'alejandra.rodriguez@yahoo.com', 'Calle 50 #12-34, Barranquilla, Colombia', 'Alejandra Sofía Rodríguez Peña', 'cancelado', 0.00, NULL);

-- Insertar productos de las órdenes usando productos reales del product-service
INSERT INTO order_products (orden_id, producto_id, nombre, precio, descuento, marca, modelo, cantidad, imagen) VALUES
-- Orden 1: María - HP Intel Core I3 + descuento
(1, 1, 'HP Intel Core I3 - 8GB', 3299000.00, 54.00, 'HP', '15-fd0026la', 1, '198122843657-001-750Wx750H.webp'),

-- Orden 2: Carlos - ASUS Vivobook (sin descuento para mostrar precio completo)
(2, 9, 'ASUS Vivobook Intel Core I5 - 16GB', 3799000.00, 0.00, 'ASUS', 'X1605VA-MB1193W', 1, '4711387799109-001-750Wx750H.webp'),

-- Orden 3: Valentina - ASUS Vivobook AMD R7 (con descuento)
(3, 6, 'ASUS Vivobook AMD R7 - 16GB', 4699000.00, 48.00, 'ASUS', 'M1405YA-LY293W', 1, '4711636049719-003-750Wx750H.webp'),

-- Orden 4: Alejandra - ASUS TUF Gaming (producto premium)
(4, 5, 'ASUS TUF Intel Core I5 - 16GB', 5899000.00, 40.00, 'ASUS', 'FX607VJ-RL165W', 1, '4711636030427-001-750Wx750H.webp'),

-- Orden 5: Isabella - LENOVO IdeaPad AMD R7
(5, 10, 'LENOVO IdeaPad AMD R7 - 16GB', 4099000.00, 48.00, 'LENOVO', '82XM00W0LM', 1, '198157260429-001-750Wx750H.webp'),

-- Orden 6: Diego - HP Pavilion (producto convertible)
(6, 11, 'HP Pavilion Intel Core I5 - 8GB', 4499000.00, 50.00, 'HP', '14-ek1011la', 1, '198990192536-001-750Wx750H.webp'),

-- Orden 7: Sebastián - HP Intel Core I5 (producto popular)
(7, 8, 'HP Intel Core I5 - 8GB', 3999000.00, 45.00, 'HP', '14-Ep1001la', 1, '198415103550-001-750Wx750H.webp'),

-- Orden 8: Mateo - ASUS Vivobook Intel Core I3 (producto económico)
(8, 12, 'ASUS Vivobook Intel Core I3 - 8GB', 3269000.00, 51.00, 'ASUS', 'E1504GA-NJ531W', 1, '4711387562987-003-750Wx750H.webp'),

-- Orden 9: María (segunda compra) - Combo de productos
(9, 3, 'HP Intel Core I5 - 16GB', 4999000.00, 50.00, 'HP', '15-fd1255la', 1, '199251256417-003-750Wx750H.webp'),
(9, 13, 'ASUS Vivobook Intel Core I5 - 8GB', 3799000.00, 47.00, 'ASUS', 'X1605VA-MB1625W', 1, '4711387805114-001-750Wx750H.webp'),

-- Órdenes canceladas (productos que estaban en el carrito pero se cancelaron)
(10, 4, 'HP AMD R7 - 16GB', 4599000.00, 48.00, 'HP', '15-fc0276la', 1, '198990787145-001-750Wx750H.webp'),
(11, 2, 'Lenovo AMD R5 - 24GB', 3999000.00, 40.00, 'LENOVO', '83KA001NLM', 1, '198155958762-001-750Wx750H.webp');

-- =====================================================
-- VISTAS ÚTILES PARA CONSULTAS
-- =====================================================

-- Vista para órdenes con información resumida
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
    o.orden_id,
    o.user_id,
    o.correo_usuario,
    o.nombre_completo,
    o.estado,
    o.total,
    o.fecha_pago,
    o.fecha_entrega,
    COUNT(op.orden_productos_id) as total_productos,
    SUM(op.cantidad) as total_items
FROM orders o
LEFT JOIN order_products op ON o.orden_id = op.orden_id
GROUP BY o.orden_id;

-- Vista para productos más vendidos
CREATE OR REPLACE VIEW productos_mas_vendidos AS
SELECT 
    op.producto_id,
    op.nombre,
    op.marca,
    op.modelo,
    COUNT(*) as veces_ordenado,
    SUM(op.cantidad) as total_vendido,
    AVG(op.precio) as precio_promedio
FROM order_products op
JOIN orders o ON op.orden_id = o.orden_id
WHERE o.estado IN ('procesando', 'enviado', 'entregado')
GROUP BY op.producto_id, op.nombre, op.marca, op.modelo
ORDER BY total_vendido DESC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

-- Procedimiento para calcular el total de una orden
DELIMITER //
CREATE PROCEDURE CalcularTotalOrden(IN orden_id_param INT)
BEGIN
    DECLARE total_calculado DECIMAL(10,2) DEFAULT 0.00;
    
    -- Calcular total basado en productos
    SELECT SUM(precio * cantidad * (1 - descuento/100)) INTO total_calculado
    FROM order_products 
    WHERE orden_id = orden_id_param;
    
    -- Actualizar el total en la orden
    UPDATE orders 
    SET total = COALESCE(total_calculado, 0.00)
    WHERE orden_id = orden_id_param;
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS PARA MANTENER CONSISTENCIA
-- =====================================================

-- Trigger para recalcular total cuando se modifica un producto
DELIMITER //
CREATE TRIGGER recalcular_total_orden
AFTER INSERT ON order_products
FOR EACH ROW
BEGIN
    CALL CalcularTotalOrden(NEW.orden_id);
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER recalcular_total_orden_update
AFTER UPDATE ON order_products
FOR EACH ROW
BEGIN
    CALL CalcularTotalOrden(NEW.orden_id);
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER recalcular_total_orden_delete
AFTER DELETE ON order_products
FOR EACH ROW
BEGIN
    CALL CalcularTotalOrden(OLD.orden_id);
END //
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice compuesto para consultas de órdenes por usuario y estado
CREATE INDEX idx_user_estado ON orders(user_id, estado);

-- Índice para consultas por rango de fechas
CREATE INDEX idx_fecha_pago_estado ON orders(fecha_pago, estado);

-- Índice para búsquedas de productos por marca y modelo
CREATE INDEX idx_marca_modelo ON order_products(marca, modelo);

COMMIT;

-- =====================================================
-- INFORMACIÓN DE INICIALIZACIÓN COMPLETADA
-- =====================================================
SELECT 'Base de datos orders_db inicializada correctamente' AS status;
SELECT COUNT(*) AS total_ordenes FROM orders;
SELECT COUNT(*) AS total_productos_ordenados FROM order_products;