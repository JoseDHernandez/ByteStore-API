-- =====================================================
-- SCRIPT DE INICIALIZACIÓN - ORDERS SERVICE
-- Base de datos para gestión de órdenes - ByteStore
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS orders_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE orders_db;

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
('ASUS Vivobook AMD R7 - 16GB', 4699000.00, 48, 'ASUS', 'M1405YA-LY293W', '4711636049719-003-750Wx750H.webp', 60),
('ASUS TUF Intel Core I5 - 16GB', 5899000.00, 40, 'ASUS', 'FX607VJ-RL165W', '4711636030427-001-750Wx750H.webp', 40),
('LENOVO IdeaPad AMD R7 - 16GB', 4099000.00, 48, 'LENOVO', '82XM00W0LM', '198157260429-001-750Wx750H.webp', 75),
('HP Pavilion Intel Core I5 - 8GB', 4499000.00, 50, 'HP', '14-ek1011la', '198990192536-001-750Wx750H.webp', 55),
('HP Intel Core I5 - 8GB', 3999000.00, 45, 'HP', '14-Ep1001la', '198415103550-001-750Wx750H.webp', 70),
('ASUS Vivobook Intel Core I3 - 8GB', 3269000.00, 51, 'ASUS', 'E1504GA-NJ531W', '4711387562987-003-750Wx750H.webp', 90),
('HP Intel Core I5 - 16GB', 4999000.00, 50, 'HP', '15-fd1255la', '199251256417-003-750Wx750H.webp', 65),
('ASUS Vivobook Intel Core I5 - 8GB', 3799000.00, 47, 'ASUS', 'X1605VA-MB1625W', '4711387805114-001-750Wx750H.webp', 85),
('HP AMD R7 - 16GB', 4599000.00, 48, 'HP', '15-fc0276la', '198990787145-001-750Wx750H.webp', 50),
('Lenovo AMD R5 - 24GB', 3999000.00, 40, 'LENOVO', '83KA001NLM', '198155958762-001-750Wx750H.webp', 60);

-- =====================================================
-- TABLA: orders (órdenes)
-- Almacena la información principal de cada orden
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    orden_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL COMMENT 'ID del usuario que realizó la orden',
    correo_usuario VARCHAR(300) NOT NULL COMMENT 'Email del usuario',
    direccion TEXT NOT NULL COMMENT 'Dirección de entrega (manual si no hay geolocalización)',
    nombre_completo VARCHAR(200) NOT NULL COMMENT 'Nombre completo del cliente',
    estado ENUM('en_proceso', 'cancelado', 'retrasado', 'entregado') DEFAULT 'en_proceso' COMMENT 'Estado actual de la orden',
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total de la orden (incluye costo de envío si aplica)',
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del pago',
    fecha_entrega_original TIMESTAMP NULL COMMENT 'Fecha de entrega original (estimada)',
    fecha_entrega_retrasada TIMESTAMP NULL COMMENT 'Fecha de entrega con retraso',
    tipo_entrega ENUM('domicilio', 'recoger') NOT NULL DEFAULT 'domicilio' COMMENT 'Tipo de entrega',
    costo_envio DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Costo de envío calculado',
    geolocalizacion_habilitada TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Bandera de uso de geolocalización',
    latitud DECIMAL(9,6) NULL COMMENT 'Latitud del usuario (si geolocalización habilitada)',
    longitud DECIMAL(9,6) NULL COMMENT 'Longitud del usuario (si geolocalización habilitada)',
    metodo_pago ENUM('tarjeta', 'pse', 'efectivo') NOT NULL DEFAULT 'tarjeta' COMMENT 'Método de pago',
    card_type ENUM('debito', 'credito') NULL COMMENT 'Tipo de tarjeta',
    card_brand ENUM('VISA', 'MASTERCARD') NULL COMMENT 'Marca de tarjeta',
    card_last4 CHAR(4) NULL COMMENT 'Últimos 4 dígitos de la tarjeta',
    pse_reference VARCHAR(100) NULL COMMENT 'Referencia PSE',
    cash_on_delivery TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Pago contraentrega',
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
    product_uid VARCHAR(255) NULL COMMENT 'UID del producto (opcional)',
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
    estado_anterior ENUM('en_proceso', 'cancelado', 'retrasado', 'entregado') NOT NULL COMMENT 'Estado anterior de la orden',
    estado_nuevo ENUM('en_proceso', 'cancelado', 'retrasado', 'entregado') NOT NULL COMMENT 'Nuevo estado de la orden',
    motivo TEXT COMMENT 'Motivo del cambio de estado',
    changed_by VARCHAR(255) NOT NULL COMMENT 'ID del usuario que realizó el cambio',
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
INSERT INTO orders (user_id, correo_usuario, direccion, nombre_completo, estado, total, fecha_entrega_original) VALUES
-- Órdenes entregadas
('01991c11-412e-7569-bb85-a4f77ba08bb7', 'maria.lopez@gmail.com', 'Carrera 45 #23-12, Medellín, Colombia', 'María Fernanda López García', 'entregado', 3134550.00, '2024-01-15 14:30:00'),
('cliente-002-uuid-7890-123456789012', 'carlos.martinez@hotmail.com', 'Avenida 68 #125-30, Cali, Colombia', 'Carlos Eduardo Martínez Silva', 'entregado', 3799000.00, '2024-01-18 16:45:00'),
('cliente-005-uuid-9012-345678901234', 'valentina.torres@gmail.com', 'Calle 85 #47-23, Bogotá, Colombia', 'Valentina Isabel Torres Moreno', 'entregado', 4699000.00, '2024-01-22 11:20:00'),

-- Órdenes en proceso (antes "enviadas")
('cliente-003-uuid-3456-789012345678', 'alejandra.rodriguez@yahoo.com', 'Calle 50 #12-34, Barranquilla, Colombia', 'Alejandra Sofía Rodríguez Peña', 'en_proceso', 5899000.00, '2024-01-25 10:00:00'),
('cliente-007-uuid-5678-901234567890', 'isabella.herrera@hotmail.com', 'Carrera 11 #93-45, Medellín, Colombia', 'Isabella María Herrera Castro', 'en_proceso', 4099000.00, '2024-01-26 15:30:00'),

-- Órdenes en proceso (antes "procesando")
('cliente-004-uuid-6789-012345678901', 'diego.gonzalez@outlook.com', 'Carrera 15 #28-45, Bucaramanga, Colombia', 'Diego Andrés González Vargas', 'en_proceso', 4499000.00, NULL),
('cliente-006-uuid-2345-678901234567', 'sebastian.jimenez@gmail.com', 'Avenida 19 #104-62, Bogotá, Colombia', 'Sebastián Camilo Jiménez Rojas', 'en_proceso', 3999000.00, NULL),

-- Órdenes en proceso (antes "pendiente")
('cliente-008-uuid-8901-234567890123', 'mateo.vasquez@yahoo.com', 'Calle 127 #15-78, Bogotá, Colombia', 'Mateo Alejandro Vásquez Luna', 'en_proceso', 3269000.00, NULL),
('01991c11-412e-7569-bb85-a4f77ba08bb7', 'maria.lopez@gmail.com', 'Carrera 45 #23-12, Medellín, Colombia', 'María Fernanda López García', 'en_proceso', 7598000.00, NULL),

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
WHERE o.estado IN ('en_proceso', 'retrasado', 'entregado')
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