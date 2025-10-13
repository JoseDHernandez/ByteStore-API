## Geolocalización y opciones de entrega

Este servicio soporta dos modos de entrega y geolocalización opcional:

- `tipo_entrega`: `domicilio` o `recoger`.
- `geolocalizacion_habilitada`: bandera para indicar si el cliente comparte coordenadas.
- `latitud` y `longitud`: coordenadas del cliente cuando la geolocalización está habilitada.

### Reglas de validación

- Si `geolocalizacion_habilitada` es `true`, se deben enviar `latitud` y `longitud`.
- Si `tipo_entrega` es `domicilio` y no hay geolocalización válida, `direccion` es requerida.
- Si `tipo_entrega` es `recoger`, `direccion` es opcional.

### Cálculo de costo de envío

Se usa una tarifa base de 10.000 COP más 500 COP por kilómetro calculado con la fórmula de Haversine entre las coordenadas del cliente y la tienda (Bogotá: `4.7110, -74.0721`).

- Sin geolocalización (domicilio): costo plano de 12.500 COP.
- Recoger en tienda: 0 COP.

### Ejemplos de payload

Entrega a domicilio con dirección (sin geolocalización):

```json
{
  "user_id": "01991c11-...",
  "correo_usuario": "cliente@example.com",
  "direccion": "Calle 123 #45-67, Bogotá",
  "tipo_entrega": "domicilio",
  "nombre_completo": "Cliente Ejemplo",
  "metodo_pago": "tarjeta",
  "tarjeta": { "tipo": "debito", "marca": "VISA", "numero": "4111111111111111" },
  "productos": [{ "producto_id": 1, "cantidad": 1 }]
}
```

Entrega a domicilio con geolocalización:

```json
{
  "user_id": "01991c11-...",
  "correo_usuario": "cliente@example.com",
  "tipo_entrega": "domicilio",
  "geolocalizacion_habilitada": true,
  "latitud": 4.65,
  "longitud": -74.09,
  "nombre_completo": "Cliente Ejemplo",
  "metodo_pago": "pse",
  "pse_reference": "PSE-REF-12345",
  "productos": [{ "producto_id": 2, "cantidad": 1 }]
}
```

Recoger en tienda:

```json
{
  "user_id": "01991c11-...",
  "correo_usuario": "cliente@example.com",
  "tipo_entrega": "recoger",
  "nombre_completo": "Cliente Ejemplo",
  "metodo_pago": "efectivo",
  "cash_on_delivery": true,
  "productos": [{ "producto_id": 3, "cantidad": 2 }]
}
```

### Consideraciones para Android

- Permisos: `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION`.
- Runtime permissions (API 23+): solicitar en tiempo de ejecución.
- API recomendada: FusedLocationProviderClient (Google Play Services).
- Buenas prácticas: obtener coordenadas con precisión balanceada, manejo de casos sin GPS, y degradar a dirección manual si no se conceden permisos.