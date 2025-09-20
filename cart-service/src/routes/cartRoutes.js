const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const dataService = require('../services/dataService'); // <-- Importar dataService

// Aplicar autenticación a todas las rutas
router.use(verifyToken);



// CRUD principal de carritos
router.get('/', cartController.getAllCarts.bind(cartController)); // paginado y por user_id
router.get('/:id', cartController.getCartById.bind(cartController)); // obtener carrito por id
router.post('/', cartController.createCart.bind(cartController)); // crear

// Rutas antiguas con prefijo para no interferir con '/'
const oldRouter = express.Router();
oldRouter.get('/list', async (req, res) => {
	// Ejemplo de lógica para listar carritos antiguos
	const carts = await dataService.getCarts();
	res.json({ carts });
});

module.exports = { router, oldRouter };
router.put('/:id', cartController.updateCart.bind(cartController)); // actualizar productos
router.delete('/:id', cartController.deleteCart.bind(cartController)); // eliminar carrito

// Rutas de productos en la raíz
router.post('/:id/products', cartController.addProductToCart.bind(cartController));
router.put('/:id/products/:productId', cartController.updateProductInCart.bind(cartController));
router.delete('/:id/products/:productId', cartController.removeProductFromCart.bind(cartController));
router.delete('/:id/clear', cartController.clearCart.bind(cartController));

// Rutas informativas
router.get('/info', (req, res) => {
  res.json({ service: 'cart-service', status: 'ok' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = { router };