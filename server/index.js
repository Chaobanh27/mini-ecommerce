require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;


// For webhook we need raw body. We'll mount webhook route before JSON body parser for that route
const checkoutRouter = require('./routes/checkout');
const webhookRouter = require('./routes/webhook');
const invoicesRouter = require('./routes/invoices');

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
app.use('/api/checkout', checkoutRouter);

// webhook route expects raw body and sets up its own parser inside route file
app.use('/api/webhook', webhookRouter);
app.use('/api/invoices', invoicesRouter);
app.get('/', (req, res) => res.send('MERN Ecom Server'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongo connected');
        app.listen(PORT, () => console.log(`Server listening ${PORT}`));
    })
    .catch(err => {
        console.error('Mongo connect error', err);
    });