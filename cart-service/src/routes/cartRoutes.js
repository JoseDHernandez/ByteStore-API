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

// Rutas legacy (antiguas) bajo prefijo /legacy
const legacyRouter = express.Router();
legacyRouter.use(verifyToken);

legacyRouter.get('/', cartController.getAllCarts.bind(cartController));
legacyRouter.get('/:id', cartController.getCartById.bind(cartController));
legacyRouter.post('/', cartController.createCart.bind(cartController));
legacyRouter.put('/:id', cartController.updateCart.bind(cartController));
legacyRouter.delete('/:id', cartController.deleteCart.bind(cartController));

// Ajuste: usar el método correcto definido en cartController
// No existe getCartByUserId, pero sí getCartByUserQuery (por query param)
// Si necesitas buscar por userId en la ruta, puedes crear un método wrapper o usar getAllCarts con filtro
legacyRouter.get('/user/:userId', async (req, res) => {
	// Redirigir a getAllCarts pero forzando el filtro user_id
	req.query.user_id = req.params.userId;
	await cartController.getAllCarts(req, res);
});

legacyRouter.post('/:id/products', cartController.addProductToCart.bind(cartController));
legacyRouter.put('/:id/products/:productId', cartController.updateProductInCart.bind(cartController));
legacyRouter.delete('/:id/products/:productId', cartController.removeProductFromCart.bind(cartController));
legacyRouter.delete('/:id/clear', cartController.clearCart.bind(cartController));

module.exports = { router, legacyRouter };