import type { RowDataPacket } from 'mysql2';
import { db } from '../db.js';

export interface ProductCatalogEntry {
  id: number;
  nombre: string;
  precio: number;
  descuento: number;
  marca: string;
  modelo: string;
  imagen: string | null;
}

/**
 * Fetch catalog data for the requested product ids from the local products table.
 * Returns a map keyed by product id for quick lookups.
 */
export async function getCatalogProductsByIds(
  productIds: number[]
): Promise<Map<number, ProductCatalogEntry>> {
  const uniqueIds = Array.from(new Set(productIds));
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const placeholders = uniqueIds.map(() => '?').join(',');
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, nombre, precio, descuento, marca, modelo, imagen
     FROM products
     WHERE id IN (${placeholders})`,
    uniqueIds
  );

  const catalog = new Map<number, ProductCatalogEntry>();
  for (const row of rows) {
    const id = Number(row.id);
    catalog.set(id, {
      id,
      nombre: String(row.nombre),
      precio: Number(row.precio ?? 0),
      descuento: Number(row.descuento ?? 0),
      marca: String(row.marca ?? ''),
      modelo: String(row.modelo ?? ''),
      imagen: row.imagen ? String(row.imagen) : null,
    });
  }

  return catalog;
}
