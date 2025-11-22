import { Router } from 'express';
import {
  addProductToOrder,
  updateProductInOrder,
  removeProductFromOrder,
  getOrderProducts,
} from '../controllers/orderProducts.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar productos de una orden
router.get('/:id/products', getOrderProducts);

// Agregar producto a una orden
router.post('/:id/products', addProductToOrder);

// Actualizar un producto de una orden
router.put('/:id/products/:productId', updateProductInOrder);

// Eliminar un producto de una orden
router.delete('/:id/products/:productId', removeProductFromOrder);

export default router;
