export interface Order {
  orden_id: number;
  user_id: string;
  correo_usuario: string;
  direccion: string;
  nombre_completo: string;
  estado: string;
  total: number;
  fecha_pago?: string;
  fecha_entrega_original?: string;
  fecha_entrega_retrasada?: string;
  tipo_entrega?: "domicilio" | "recoger";
  costo_envio?: number;
  geolocalizacion_habilitada?: boolean;
  latitud?: number;
  longitud?: number;
  metodo_pago?: "tarjeta" | "pse" | "efectivo";
  card_type?: "debito" | "credito";
  card_brand?: "VISA" | "MASTERCARD";
  card_last4?: string;
  pse_reference?: string;
  cash_on_delivery?: boolean;
}

export interface OrderProduct {
  orden_productos_id: number;
  orden_id: number;
  producto_id: number;
  product_uid?: string;
  nombre: string;
  precio: number;
  descuento: number;
  marca: string;
  modelo: string;
  cantidad: number;
  imagen: string;
  subtotal: number;
}

export interface OrderCreateDTO {
  user_id: string;
  correo_usuario: string;
  direccion: string;
  tipo_entrega?: "domicilio" | "recoger";
  geolocalizacion_habilitada?: boolean;
  latitud?: number;
  longitud?: number;
  nombre_completo: string;
  metodo_pago?: "tarjeta" | "pse" | "efectivo";
  tarjeta?: {
    tipo: "debito" | "credito";
    marca: "VISA" | "MASTERCARD";
    numero: string; // solo se usará para derivar last4
  };
  pse_reference?: string;
  cash_on_delivery?: boolean;
  productos: {
    producto_id: number;
    cantidad: number;
  }[];
}

export interface OrderUpdateDTO {
  estado?: "en_proceso" | "cancelado" | "retrasado" | "entregado";
  direccion?: string;
  fecha_entrega_original?: string;
  fecha_entrega_retrasada?: string;
  tipo_entrega?: "domicilio" | "recoger";
  geolocalizacion_habilitada?: boolean;
  latitud?: number;
  longitud?: number;
  metodo_pago?: "tarjeta" | "pse" | "efectivo";
  tarjeta?: {
    tipo: "debito" | "credito";
    marca: "VISA" | "MASTERCARD";
    numero: string;
  };
  pse_reference?: string;
  cash_on_delivery?: boolean;
}

export interface OrderResponseDTO {
  orden_id: number;
  user_id: string;
  correo_usuario: string;
  direccion: string;
  nombre_completo: string;
  estado: string;
  total: number;
  fecha_pago?: string;
  fecha_entrega_original?: string;
  fecha_entrega_retrasada?: string;
  tipo_entrega?: "domicilio" | "recoger";
  costo_envio?: number;
  geolocalizacion_habilitada?: boolean;
  latitud?: number;
  longitud?: number;
  metodo_pago?: "tarjeta" | "pse" | "efectivo";
  card_type?: "debito" | "credito";
  card_brand?: "VISA" | "MASTERCARD";
  card_last4?: string;
  pse_reference?: string;
  cash_on_delivery?: boolean;
  productos: OrderProduct[];
}

export interface OrdersPaginatedResponse {
  total: number;
  pages: number;
  first: number;
  next: number | null;
  prev: number | null;
  data: OrderResponseDTO[];
}