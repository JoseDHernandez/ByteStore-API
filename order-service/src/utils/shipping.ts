export interface ShippingInput {
  tipo_entrega: "domicilio" | "recoger";
  geolocalizacion_habilitada?: boolean;
  latitud?: number;
  longitud?: number;
}

// Coordenadas de referencia de la tienda (Bogotá) para cálculo de distancia
const STORE_LAT = 4.7110;
const STORE_LNG = -74.0721;

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcula costo de envío en COP.
 * - Recoger en tienda: 0
 * - Domicilio: base 10,000 + 500 * distancia (km) si hay coordenadas
 * - Sin coordenadas: costo plano 12,500
 */
export function calculateShippingCost(input: ShippingInput): number {
  if (input.tipo_entrega === "recoger") return 0;

  const BASE = 10000;
  if (input.geolocalizacion_habilitada && input.latitud && input.longitud) {
    const km = haversineKm(STORE_LAT, STORE_LNG, input.latitud, input.longitud);
    return Math.round(BASE + 500 * km);
  }
  return 12500; // costo plano si no hay geolocalización
}