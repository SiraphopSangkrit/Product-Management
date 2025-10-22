require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb://database:27017/productdb';

console.log('Attempting to connect to MongoDB at:', mongoURI);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  console.log('MongoDB URI being used:', mongoURI);
});

db.on('connected', () => {
  console.log('MongoDB connected successfully to:', mongoURI);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = db;