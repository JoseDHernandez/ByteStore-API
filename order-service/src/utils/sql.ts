import { ISO_DATE_FORMAT } from "./date.js";

export const ORDER_PRODUCTS_SELECT_FIELDS = `
  orden_productos_id,
  producto_id,
  nombre,
  precio,
  descuento,
  marca,
  modelo,
  cantidad,
  imagen,
  (precio * cantidad * (1 - descuento/100)) as subtotal
`;

export const ORDER_SELECT_FIELDS = `
  orden_id,
  user_id,
  correo_usuario,
  direccion,
  nombre_completo,
  estado,
  total,
  DATE_FORMAT(fecha_pago, '${ISO_DATE_FORMAT}') as fecha_pago,
  DATE_FORMAT(fecha_entrega, '${ISO_DATE_FORMAT}') as fecha_entrega
`;