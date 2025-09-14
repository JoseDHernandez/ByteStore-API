const dataService = require('../services/dataService');
const { createCartSchema, updateCartSchema } = require('../validation/cartSchemas');

class CartController {
  // Obtener un carrito por user_id usando query param (?user_id=...)
  async getCartByUserQuery(req, res) {
    try {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ error: 'Falta user_id en query' });
      const cart = await dataService.getCartByUserId(user_id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado para este usuario' });
      // Validar permisos: solo el dueño o admin puede ver
      if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver este carrito' });
      }
      // Devolver productos completos
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }
  // Obtener todos los carritos (admin ve todos, usuario solo el suyo)
  async getAllCarts(req, res) {
    try {
      const { _page, _per_page, user_id } = req.query;
      let filters = {};
      if (req.user.role !== 'ADMINISTRADOR') {
        filters.user_id = req.user.id;
      } else if (user_id) {
        filters.user_id = user_id;
      }
      const carts = await dataService.getCarts(filters);
      // Si se busca por user_id, devolver solo el array de carritos (sin paginación ni metadatos)
      if (user_id) {
        return res.json(carts);
      }
      // Si no, devolver paginado como antes
      const page = parseInt(_page) || 1;
      const perPage = parseInt(_per_page) || 10;
      const result = dataService.paginate(carts, page, perPage);
      return res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Obtener un carrito por ID
  async getCartById(req, res) {
    try {
      const { id } = req.params;
      const cart = await dataService.getCartById(id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
      // Solo el dueño o admin puede ver el carrito
  if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver este carrito' });
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Crear un carrito para el usuario (user_id y products[] en body)
  async createCart(req, res) {
    try {
      const parse = createCartSchema.safeParse(req.body);
      if (!parse.success) {
        // Devuelve detalles del error para depurar
        return res.status(400).json({ error: 'Datos inválidos', details: parse.error.errors });
      }
      const { user_id, products = [] } = parse.data;
      let cart = await dataService.getCartByUserId(user_id);
      if (cart) return res.status(409).json({ error: 'Ya existe un carrito para este usuario' });
      // Si los productos traen más campos, guárdalos todos
      const productsFull = products.map(p => ({ ...p }));
      // Generar un id único para el carrito usando uuid v7
      const { v7: uuidv7 } = require('uuid');
      const id = uuidv7();
      cart = await dataService.createCart({ id, user_id, products: productsFull, createdAt: new Date().toISOString() });
      res.status(201).json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Actualizar todos los productos del carrito (PUT /:id)
  async updateCart(req, res) {
    try {
      let body = req.body;
      // Si products viene como objeto, conviértelo en array
      if (body && body.products && !Array.isArray(body.products)) {
        body.products = [body.products];
      }
      const parse = updateCartSchema.safeParse(body);
      if (!parse.success) {
        return res.status(400).json({ error: 'Datos inválidos', details: parse.error.errors });
      }
      const { id } = req.params;
      const { products } = parse.data;

      // Validar que no haya productos con el mismo id
      const ids = products.map(p => p.id);
      const idsSet = new Set(ids);
      if (ids.length !== idsSet.size) {
        return res.status(400).json({ error: 'No se permiten productos duplicados en el carrito (id repetido)' });
      }

      const cart = await dataService.getCartById(id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
      if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
      }
      const updated = await dataService.updateCart(id, { products });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Eliminar un carrito por user_id (DELETE /:id)
  async deleteCart(req, res) {
    try {
      const { id } = req.params;
      const cart = await dataService.getCartById(id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este carrito' });
      }
      await dataService.deleteCart(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Agregar un producto al carrito
  async addProductToCart(req, res) {
    try {
      const { id } = req.params; // id del carrito
      const { id: productId, ...productData } = req.body;
      const cart = await dataService.getCartById(id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
      }
      // Si el producto ya existe, no lo duplica, solo suma cantidad
      let found = false;
      const newProducts = cart.products.map(p => {
        if (p.id === productId) {
          found = true;
          return { ...p, quantity: (p.quantity || 0) + (productData.quantity || 1) };
        }
        return p;
      });
      if (!found) {
        newProducts.push({ id: productId, ...productData });
      }
      const updated = await dataService.updateCart(id, { products: newProducts });
      res.status(201).json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Actualizar la cantidad de un producto en el carrito
  async updateProductInCart(req, res) {
    try {
      const { id, productId } = req.params;
      const { quantity } = req.body;
      const cart = await dataService.getCartById(id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
      }
      const newProducts = cart.products.map(p =>
        p.id === productId ? { ...p, quantity } : p
      );
      const updated = await dataService.updateCart(id, { products: newProducts });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Eliminar un producto del carrito
  async removeProductFromCart(req, res) {
    try {
      const { id, productId } = req.params;
      const cart = await dataService.getCartById(id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
      }
      const newProducts = cart.products.filter(p => p.id !== productId);
      const updated = await dataService.updateCart(id, { products: newProducts });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }

  // Vaciar el carrito por completo
  async clearCart(req, res) {
    try {
      const { id } = req.params;
      const cart = await dataService.getCartById(id);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  if (req.user.role !== 'ADMINISTRADOR' && cart.user_id !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
      }
      const updated = await dataService.updateCart(id, { products: [] });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }
}

module.exports = new CartController();