# Guía Completa de Pruebas API - ByteStore

## 📋 Resumen de Endpoints Identificados

### 🔐 Authentication Service (Puerto 3002)
- `POST /sign-up` - Registro de usuario
- `POST /sign-in` - Inicio de sesión

### 👥 User Management Service (Puerto 3002)
- `GET /` - Obtener usuarios paginados (Admin)
- `GET /:id` - Obtener usuario por ID
- `GET /all` - Obtener todos los usuarios (Admin)
- `PUT /:id` - Actualizar usuario
- `DELETE /:id` - Eliminar usuario
- `PATCH /:id/role` - Cambiar rol (Admin)
- `PATCH /:id/password` - Actualizar contraseña

### 🛍️ Product Service (Puerto 3001)
- `GET /products` - Obtener productos (público)
- `GET /products/:id` - Obtener producto por ID (público)
- `POST /products` - Crear producto (requiere auth)
- `PUT /products/:id` - Actualizar producto (requiere auth)
- `DELETE /products/:id` - Eliminar producto (requiere auth)
- `GET /products/filters` - Obtener filtros disponibles

### 📦 Orders Service (Puerto 3004)
- `GET /orders` - Obtener órdenes
- `POST /orders` - Crear orden
- `GET /orders/stats` - Estadísticas de órdenes
- `GET /orders/:id` - Obtener orden por ID
- `PUT /orders/:id` - Actualizar orden
- `DELETE /orders/:id` - Eliminar orden (Admin)
- `PUT /orders/:id/status` - Actualizar estado (Admin)
- `GET /orders/:id/status/history` - Historial de estados
- `PUT /orders/:id/cancel` - Cancelar orden
- `GET /orders/status/stats` - Estadísticas de estados

### ⭐ Reviews Service (Puerto 3003)
- `GET /reviews` - Obtener reseñas
- `POST /reviews` - Crear reseña
- `GET /reviews/:id` - Obtener reseña por ID
- `PUT /reviews/:id` - Actualizar reseña
- `DELETE /reviews/:id` - Eliminar reseña

### 🌐 API Gateway (Puerto 3000)
- Proxy para todos los servicios

## 🚀 Configuración Inicial

### 1. Instalación de Postman
1. Descargar Postman desde [postman.com](https://www.postman.com/downloads/)
2. Instalar y crear cuenta
3. Importar la colección: `ByteStore-API-Tests.postman_collection.json`
4. Importar el entorno: `ByteStore-API-Environment.postman_environment.json`

### 2. Configuración del Entorno
- Seleccionar el entorno "ByteStore API Environment"
- Verificar las URLs base de cada servicio
- Las variables de autenticación se llenarán automáticamente

### 3. Iniciar Servicios
```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.dev.yml up -d

# O iniciar individualmente
cd user-service && npm run dev
cd product-service && npm run dev
cd orders-service && npm run dev
cd reviews-service && npm run dev
```

## 🧪 Plan de Pruebas Exhaustivas

### Fase 1: Pruebas Básicas de Conectividad

#### Health Checks
- [ ] `GET /health` en cada servicio
- [ ] Verificar respuesta 200 OK
- [ ] Validar estructura JSON de respuesta

#### Endpoints Públicos
- [ ] `GET /products` - Sin autenticación
- [ ] `GET /products/:id` - Sin autenticación
- [ ] `GET /products/filters` - Sin autenticación

### Fase 2: Autenticación y Autorización

#### Registro de Usuario
- [ ] `POST /sign-up` con datos válidos
- [ ] Verificar respuesta 201 y estructura de datos
- [ ] Guardar token automáticamente
- [ ] Probar registro con email duplicado (400)
- [ ] Probar con datos inválidos (400)

#### Inicio de Sesión
- [ ] `POST /sign-in` con credenciales válidas
- [ ] Verificar respuesta 200 y token JWT
- [ ] Probar con credenciales inválidas (401)
- [ ] Probar sin credenciales (400)

#### Validación de Token
- [ ] Usar token en endpoints protegidos
- [ ] Probar con token inválido (401)
- [ ] Probar sin token (401)
- [ ] Probar con token expirado (401)

### Fase 3: CRUD Operations

#### Gestión de Usuarios
- [ ] `GET /:id` - Obtener perfil propio
- [ ] `PUT /:id` - Actualizar perfil propio
- [ ] `PATCH /:id/password` - Cambiar contraseña
- [ ] `GET /` - Listar usuarios (solo admin)
- [ ] `PATCH /:id/role` - Cambiar rol (solo admin)
- [ ] `DELETE /:id` - Eliminar usuario

#### Gestión de Productos
- [ ] `POST /products` - Crear producto
- [ ] `PUT /products/:id` - Actualizar producto
- [ ] `DELETE /products/:id` - Eliminar producto
- [ ] Validar permisos de administrador

#### Gestión de Órdenes
- [ ] `POST /orders` - Crear orden
- [ ] `GET /orders` - Listar órdenes del usuario
- [ ] `GET /orders/:id` - Obtener orden específica
- [ ] `PUT /orders/:id` - Actualizar dirección
- [ ] `PUT /orders/:id/status` - Cambiar estado (admin)
- [ ] `PUT /orders/:id/cancel` - Cancelar orden
- [ ] `DELETE /orders/:id` - Eliminar orden (admin)

#### Gestión de Reseñas
- [ ] `POST /reviews` - Crear reseña
- [ ] `GET /reviews` - Listar reseñas
- [ ] `GET /reviews/:id` - Obtener reseña específica
- [ ] `PUT /reviews/:id` - Actualizar reseña propia
- [ ] `DELETE /reviews/:id` - Eliminar reseña propia

### Fase 4: Validación de Datos

#### Esquemas de Validación
- [ ] Probar campos requeridos faltantes
- [ ] Probar tipos de datos incorrectos
- [ ] Probar longitudes de campo inválidas
- [ ] Probar formatos inválidos (email, UUID, etc.)
- [ ] Probar valores fuera de rango

#### Casos Edge
- [ ] Strings vacíos vs null vs undefined
- [ ] Números negativos donde no corresponde
- [ ] Fechas futuras/pasadas inválidas
- [ ] IDs inexistentes
- [ ] Parámetros de paginación inválidos

### Fase 5: Pruebas de Rendimiento

#### Pruebas de Carga
- [ ] 10 usuarios concurrentes
- [ ] 50 usuarios concurrentes
- [ ] 100 usuarios concurrentes
- [ ] Medir tiempo de respuesta
- [ ] Verificar no hay errores 5xx

#### Pruebas de Estrés
- [ ] Incrementar carga gradualmente
- [ ] Identificar punto de quiebre
- [ ] Verificar recuperación después del pico

### Fase 6: Manejo de Errores

#### Errores de Cliente (4xx)
- [ ] 400 - Bad Request (datos inválidos)
- [ ] 401 - Unauthorized (sin token/token inválido)
- [ ] 403 - Forbidden (sin permisos)
- [ ] 404 - Not Found (recurso inexistente)
- [ ] 409 - Conflict (estado inválido)

#### Errores de Servidor (5xx)
- [ ] Simular caída de base de datos
- [ ] Simular timeout de red
- [ ] Verificar logs de error
- [ ] Verificar recuperación automática

## 📊 Scripts de Automatización

### Pre-request Scripts

```javascript
// Generar datos aleatorios para pruebas
pm.globals.set("random_email", "test_" + Math.random().toString(36).substring(7) + "@example.com");
pm.globals.set("random_name", "Test User " + Math.random().toString(36).substring(7));
pm.globals.set("timestamp", new Date().toISOString());
```

### Test Scripts

```javascript
// Validación básica de respuesta
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Content-Type is JSON", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// Validación de estructura de datos
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("data");
    if (jsonData.data) {
        pm.expect(jsonData.data).to.be.an("object");
    }
});

// Guardar datos para pruebas posteriores
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("auth_token", jsonData.data.token);
    }
    if (jsonData.data && jsonData.data.id) {
        pm.environment.set("user_id", jsonData.data.id);
    }
}
```

### Collection-level Tests

```javascript
// Ejecutar después de cada request
pm.test("No server errors", function () {
    pm.expect(pm.response.code).to.be.below(500);
});

pm.test("Response is valid JSON", function () {
    pm.response.to.be.json;
});
```

## 🔄 Automatización y CI/CD

### Configuración Rápida
```bash
# 1. Instalar dependencias
npm run setup

# 2. Ejecutar pruebas básicas
npm test

# 3. Ejecutar pruebas de carga
npm run test:load

# 4. Ejecutar pruebas de carga pesada
npm run test:load:heavy

# 5. Abrir reporte HTML
npm run report:open

# 6. Limpiar resultados
npm run clean
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecuta pruebas básicas con reportes completos |
| `npm run test:load` | Pruebas de carga (5 usuarios, 10 iteraciones) |
| `npm run test:load:heavy` | Pruebas de carga pesada (10 usuarios, 20 iteraciones) |
| `npm run setup` | Instala dependencias y configura el entorno |
| `npm run report:open` | Abre el reporte HTML en el navegador |
| `npm run clean` | Limpia los archivos de resultados |

### Ejecución Manual con Newman
```bash
# Instalar Newman globalmente (opcional)
npm install -g newman

# Ejecutar colección específica
newman run ByteStore-API-Tests.postman_collection.json \
  -e ByteStore-API-Environment.postman_environment.json \
  --reporters cli,html,json,junit \
  --reporter-html-export test-results/manual-report.html \
  --reporter-json-export test-results/manual-results.json \
  --reporter-junit-export test-results/manual-junit.xml \
  --delay-request 500 \
  --timeout 30000
```

### Características del Script de Automatización

#### `run-api-tests.js`
- ✅ **Reportes múltiples**: HTML, JSON, JUnit y reporte personalizado
- ✅ **Pruebas de carga**: Usuarios concurrentes configurables
- ✅ **Estadísticas detalladas**: Tiempo de respuesta, tasa de éxito, errores
- ✅ **Colores en consola**: Output legible y organizado
- ✅ **Manejo de errores**: Validación de archivos y recuperación de fallos
- ✅ **Configuración flexible**: Timeouts, delays y opciones personalizables

#### Ejemplo de Uso Avanzado
```bash
# Pruebas de carga personalizadas
node run-api-tests.js --load --concurrent=15 --iterations=25

# Pruebas básicas con configuración específica
node run-api-tests.js
```

### Integración CI/CD con GitHub Actions

El archivo `.github/workflows/api-tests.yml` incluye:

#### 🔄 **Triggers Automáticos**
- Push a ramas `main` y `develop`
- Pull Requests
- Ejecución programada diaria (6:00 AM UTC)
- Ejecución manual con parámetros

#### 🧪 **Tipos de Pruebas**
- **Normal**: Pruebas estándar de funcionalidad
- **Load**: Pruebas de carga moderada
- **Heavy Load**: Pruebas de carga intensiva

#### 📊 **Reportes y Notificaciones**
- Reportes JUnit integrados
- Comentarios automáticos en PRs
- Notificaciones Slack en fallos
- Artefactos de pruebas guardados por 30 días

#### 🔒 **Seguridad y Monitoreo**
- Escaneo de vulnerabilidades con Snyk
- Auditoría de dependencias
- Análisis de rendimiento en producción

#### 📚 **Documentación Automática**
- Generación de docs desde Postman
- Despliegue automático a GitHub Pages
- Documentación actualizada en cada release

### Variables de Entorno para CI/CD

Configura estos secrets en tu repositorio:

```bash
# URLs de APIs
API_BASE_URL=https://api.bytestore.com
PRODUCT_API_URL=https://products.bytestore.com
ORDERS_API_URL=https://orders.bytestore.com
REVIEWS_API_URL=https://reviews.bytestore.com
GATEWAY_URL=https://gateway.bytestore.com

# Notificaciones
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Seguridad
SNYK_TOKEN=your-snyk-token
```

### Monitoreo Continuo

#### Métricas Clave Monitoreadas
- ⏱️ **Tiempo de respuesta promedio**
- 📈 **Tasa de éxito de requests**
- 🧪 **Cobertura de pruebas**
- 🚨 **Detección de regresiones**
- 📊 **Tendencias de rendimiento**

#### Alertas Configuradas
- 🔴 **Críticas**: Tasa de éxito < 80%
- 🟡 **Advertencias**: Tiempo de respuesta > 2s
- 🟢 **Informativas**: Nuevas pruebas agregadas

### Integración con Herramientas Externas

#### Postman Monitor
```bash
# Configurar monitor en Postman
1. Ir a Monitors en Postman
2. Crear nuevo monitor
3. Seleccionar colección ByteStore-API-Tests
4. Configurar frecuencia (cada hora/día)
5. Configurar notificaciones por email/Slack
```

#### Newman + Docker
```dockerfile
# Dockerfile para pruebas
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "test"]
```

```bash
# Ejecutar en Docker
docker build -t bytestore-api-tests .
docker run --rm -v $(pwd)/test-results:/app/test-results bytestore-api-tests
```

## 📈 Métricas y Reportes

### KPIs a Monitorear
- ✅ Tasa de éxito de requests (>99%)
- ⏱️ Tiempo de respuesta promedio (<500ms)
- 🔒 Cobertura de casos de seguridad (100%)
- 📊 Cobertura de endpoints (100%)
- 🐛 Número de bugs encontrados
- 🔄 Tiempo de ejecución de suite completa

### Documentación de Resultados
- [ ] Capturas de pantalla de resultados
- [ ] Logs de errores encontrados
- [ ] Métricas de rendimiento
- [ ] Recomendaciones de mejora
- [ ] Plan de pruebas de regresión

## 🔧 Troubleshooting

### Problemas Comunes

1. **Servicios no responden**
   - Verificar que Docker esté ejecutándose
   - Revisar logs: `docker-compose logs [service-name]`
   - Verificar puertos disponibles

2. **Errores de autenticación**
   - Verificar que el token se guarde correctamente
   - Revisar formato del header Authorization
   - Verificar expiración del token

3. **Errores de CORS**
   - Verificar configuración en api-gateway
   - Usar URLs correctas (localhost vs 127.0.0.1)

4. **Timeouts**
   - Aumentar timeout en Postman
   - Verificar conectividad de red
   - Revisar logs de base de datos

### Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Reiniciar un servicio específico
docker-compose -f docker-compose.dev.yml restart user-service

# Verificar estado de contenedores
docker ps

# Limpiar y reiniciar todo
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

## ✅ Checklist Final

- [ ] Todos los endpoints identificados y documentados
- [ ] Colección de Postman creada e importada
- [ ] Entorno configurado correctamente
- [ ] Pruebas básicas ejecutadas exitosamente
- [ ] Pruebas de autenticación completadas
- [ ] Validación de datos implementada
- [ ] Pruebas de rendimiento realizadas
- [ ] Manejo de errores verificado
- [ ] Scripts de automatización configurados
- [ ] Documentación generada
- [ ] Integración CI/CD configurada
- [ ] Métricas y reportes establecidos

---

**Nota**: Esta guía debe actualizarse conforme evolucione la API. Mantener sincronizada con los cambios en el código fuente.