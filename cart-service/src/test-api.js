// Script de pruebas para el API de carritos
// Ejecutar con: node test-api.js

const baseURL = 'http://localhost:5000';

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
      ...(options.headers || {})
    }
  };

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