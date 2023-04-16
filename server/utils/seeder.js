const Product = require('../models/product');
const Order = require('../models/order.js');
const orders = require('../data/orders.json')
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');
const products = require('../data/products');
const { connect } = require('mongoose');
const User = require('../models/user');

dotenv.config({ path: 'server/config/config.env'});

connectDatabase();

const seedDatabase = async () => {
  try {
    // await Product.deleteMany();
    await Order.deleteMany();
    // console.log('All products are deleted!');
    // await Product.insertMany(products);
    // await Product.insertMany(products);
    // await Product.insertMany(products);
    // await Product.insertMany(products);
    // await Product.insertMany(products);
    // console.log('Products inserted!');
    // await User.deleteMany();
    console.log('Done!');

    // await Order.deleteMany();
  } catch(error) {
    console.log(error.message);
    process.exit();
  }
}

seedDatabase();
