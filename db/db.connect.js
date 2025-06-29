const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

const initializeDatabase = async () => {
  try {
    const connection = await mongoose.connect(MONGODB_URI);

    if (connection) {
      console.log('Connected to database');
    }
  } catch (error) {
    console.log('Error connecting to database', error);
  }
};

module.exports = { initializeDatabase };
