// Script de pruebas para el API de carritos
// Ejecutar con: node test-api.js

const baseURL = 'http://localhost:8000';

// Tokens de ejemplo (estos serían generados por tu sistema de autenticación)
// Tokens de ejemplo válidos (NO usar en producción)
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTg5NDkzLTBkZWYtN2Y0MS1hYjQwLTIwYjA0Njc5ZmJiNCIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiQURNSU5JU1RSQURPUiIsImlhdCI6MTc1NzgyNDQ0MywiZXhwIjoxNzYwNDE2NDQzfQ.OXGnRQJ0IpGjRmczxDV7Ht4UL3cQUgAvhAnDLOOO10E';
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlV4SWRQcHQiLCJlbWFpbCI6ImNvcnJlb0BlbGVjdHJvbmljby5jb20iLCJyb2xlIjowLCJpYXQiOjE3NTc4MTczODUsImV4cCI6MTc1NzkwMzc4NX0.qS0lEdycGzomECJLiJ2qBHEu8Oio6879S6dSX5n0UAU';

const fetch = require('node-fetch');

async function makeRequest(endpoint, options = {}) {
  const url = `${baseURL}${endpoint}`;
  // Eliminar referencia a /carts, ya no se usa prefijo
  const token = options.token || adminToken;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { 'Authorization': token } : {})
    },
    ...options
  };

  try {
    console.log(`\n ${config.method || 'GET'} ${endpoint}`);
    const response = await fetch(url, config);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    if (data && data.details) {
      console.log('Detalles de validación:', JSON.stringify(data.details, null, 2));
    }
    return { status: response.status, data };
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return { error: error.message };
  }
}

async function runTests() {
  // 3. Actualizar cantidad de productos con PUT usando array
  const putResArray = await makeRequest(`/01989493-0def-7f41-ab40-20b04679f745`, {
    method: 'PUT',
    headers: { 'Authorization': adminToken },
    body: JSON.stringify({
      products: [
        { id: "1", quantity: 3 },
        { id: "2", quantity: 4 }
      ]
    })
  });
  console.log('Verificando datos completos tras PUT (array)...');
  await makeRequest(`/?user_id=01989493-0def-7f41-ab40-20b04679fbb4`, {
    headers: { 'Authorization': adminToken }
  });

  // 3b. Actualizar cantidad de un solo producto con PUT usando objeto
  const putResObj = await makeRequest(`/01989493-0def-7f41-ab40-20b04679f745`, {
    method: 'PUT',
    headers: { 'Authorization': adminToken },
    body: JSON.stringify({
      products: { id: "1", quantity: 7 }
    })
  });
  console.log('Verificando datos completos tras PUT (objeto)...');
  await makeRequest(`/?user_id=01989493-0def-7f41-ab40-20b04679fbb4`, {
    headers: { 'Authorization': adminToken }
  });
  console.log(' Iniciando pruebas del API de carritos (CRUD principal)');

  // 1. Crear un carrito válido (POST /) con el JSON de prueba actualizado
  // Usar el user_id que ya existe en db.json para asegurar éxito en las pruebas
  const userId = '01989493-0def-7f41-ab40-20b04679fbb4';
  const createRes = await makeRequest('/', {
    method: 'POST',
    headers: { 'Authorization': adminToken },
    body: JSON.stringify({
      user_id: userId,
      products: [
        {
          id: 1,
          name: 'HP Intel Core I3 - 8GB',
          price: 3299000,
          discount: 54,
          stock: 20,
          image: 'http://localhost:3000/products/images/198122843657-001-750Wx750H.webp',
          model: '15-fd0026la',
          brand: 'HP',
          quantity: 1
        },
        {
          id: 2,
          name: 'HP Intel Core I3 - 8GB',
          price: 3299000,
          discount: 54,
          stock: 20,
          image: 'http://localhost:3000/products/images/198122843657-001-750Wx750H.webp',
          model: '15-fd0026la',
          brand: 'HP',
          quantity: 1
        }
      ]
    })
  });
  const cartId = createRes.data && createRes.data.id;


  // 2. Obtener carrito por user_id usando query param (GET /cart?user_id=...)
  await makeRequest(`/?user_id=${userId}`, {
    headers: { 'Authorization': adminToken }
  });

  // 4. Eliminar carrito (DELETE /:id)
  if (cartId) {
    await makeRequest(`/${cartId}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminToken }
    });
  }

  // 5. Intentar crear carrito con datos inválidos
  await makeRequest('/', {
    method: 'POST',
    headers: { 'Authorization': adminToken },
    body: JSON.stringify({
      user_id: '',
      products: 'no-es-array'
    })
  });

  // 6. Intentar acceso sin token (debe fallar)
  await makeRequest('/');

  // 7. Intentar acceso con token inválido (debe fallar)
  await makeRequest('/', {
    headers: { 'Authorization': 'token-invalido' }
  });

  console.log('\n Pruebas CRUD completadas');
}

// Solo ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  runTests();
}

module.exports = { makeRequest, runTests };