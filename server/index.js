require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Import routes
const checkoutRouter = require('./routes/checkout');
const webhookRouter = require('./routes/webhook');
const invoicesRouter = require('./routes/invoices');

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Static folder for invoices
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// Routes
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhook', webhookRouter); // has its own raw body parser
app.use('/api/invoices', invoicesRouter);

app.get('/', (req, res) => {
  res.send('✅ MERN Ecom Server running on Vercel');
});

// Connect to MongoDB only once
let isConnected = false;

async function connectMongo() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ Mongo connect error:', err);
  }
}

// Export Express handler for Vercel
module.exports = async (req, res) => {
  await connectMongo();
  app(req, res); // delegate request handling to Express
};
