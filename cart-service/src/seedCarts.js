// Script para poblar la colección de carritos en MongoDB con datos de ejemplo
const mongoose = require('mongoose');
const config = require('./config/config');

const cartSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  products: [
    {
      id: String,
      name: String,
      image: String,
      price: Number,
      discount: Number,
      quantity: Number,
      brand: String,
      model: String,
      stock: Number
    }
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

const exampleCarts = [
  {
    user_id: '01991c0e-16f0-707f-9f6f-3614666caead',
    products: [
      {
        id: 'p1',
        name: 'Teclado Mecánico',
        image: 'https://ejemplo.com/teclado.jpg',
        price: 120,
        discount: 10,
        quantity: 1,
        brand: 'Logitech',
        model: 'G512',
        stock: 20
      },
      {
        id: 'p2',
        name: 'Mouse Gamer',
        image: 'https://ejemplo.com/mouse.jpg',
        price: 60,
        discount: 5,
        quantity: 2,
        brand: 'Razer',
        model: 'DeathAdder',
        stock: 50
      }
    ]
  },
  {
    user_id: '01991c11-412e-7569-bb85-a4f77ba08bb7',
    products: [
      {
        id: 'p3',
        name: 'Monitor 24"',
        image: 'https://ejemplo.com/monitor.jpg',
        price: 200,
        discount: 0,
        quantity: 1,
        brand: 'Samsung',
        model: 'S24F350',
        stock: 15
      }
    ]
  }
];

async function seed() {
  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await Cart.deleteMany({});
  await Cart.insertMany(exampleCarts);
  console.log('Carritos de ejemplo insertados.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Error al poblar carritos:', err);
  process.exit(1);
});
