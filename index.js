const express = require('express');
const { initializeDatabase } = require('./db/db.connect');
const Menu = require('./models/menu.model');
const OrderData = require('./models/order.model');
require('dotenv').config();
const cors = require('cors');
// const fs = require('fs');

// const jsonData = fs.readFileSync('./menu.json', 'utf-8');
// const menuData = JSON.parse(jsonData);
// console.log(menuData.length);

const app = express();
const PORT = process.env.PORT || 3000;
initializeDatabase();

app.use(express.json());
app.listen(PORT, () => console.log(`Servre is listening on port ${PORT}`));

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get('/', (req, res) => res.send('Welcome to TableTop'));

function seedData() {
  try {
    for (const menuDetails of menuData) {
      const newMenu = new Menu({
        name: menuDetails.name,
        category: menuDetails.category,
        price: menuDetails.price,
        image: menuDetails.image,
      });
      newMenu.save();
    }
  } catch (error) {
    console.log('Error seeding the data: ', error);
  }
}

// seedData();

app.get('/api/menu', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { tableNumber, selectedItems } = req.body;

    if (!tableNumber || selectedItems.length === 0) {
      return res
        .status(400)
        .json({ error: 'Table number and items are required' });
    }

    // Fetch menu items and calculate total
    const populatedItems = await Promise.all(
      selectedItems.map(async ({ menuId, quantity }) => {
        const menuItem = await Menu.findById(menuId);
        if (!menuItem) throw new Error('Menu item not found');
        return {
          menuId: menuItem._id,
          quantity,
          price: menuItem.price,
        };
      })
    );

    const totalAmount = populatedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = new OrderData({
      tableNumber,
      selectedItems: populatedItems,
      status: 'Pending',
      totalAmount,
    });

    await order.save();
    res.status(201).json({ message: 'Order placed', order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/order', async (req, res) => {
  try {
    const orders = await OrderData.find()
      .populate('selectedItems.menuId', 'name price category image')
      .sort({ createdAt: -1 });

    console.log(orders);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});
