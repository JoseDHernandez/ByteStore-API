import { ISO_DATE_FORMAT } from "./date.js";

export const ORDER_PRODUCTS_SELECT_FIELDS = `
  orden_productos_id,
  producto_id,
  product_uid,
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
  DATE_FORMAT(fecha_entrega_original, '${ISO_DATE_FORMAT}') as fecha_entrega_original,
  DATE_FORMAT(fecha_entrega_retrasada, '${ISO_DATE_FORMAT}') as fecha_entrega_retrasada,
  tipo_entrega,
  costo_envio,
  geolocalizacion_habilitada,
  latitud,
  longitud,
  metodo_pago,
  card_type,
  card_brand,
  card_last4,
  pse_reference,
  cash_on_delivery
`;