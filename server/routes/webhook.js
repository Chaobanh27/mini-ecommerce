const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { generateInvoicePdf } = require('../utils/invoice');

// stripe requires raw body
router.post('/', express.raw({ type: 'application/json' }), async (req, res) =>
{
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature error', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
try {
    if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paymentIntentId = session.payment_intent || session.id;
    const order = await Order.findOne({ paymentIntentId });
    if (!order) {
        console.warn('Order not found for payment:', paymentIntentId);
        return res.json({ received: true });
    }
// Use transaction
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    try {
        for (const it of order.items) {
            const prod = await
            Product.findById(it.productId).session(mongoSession);
            if (!prod) throw new Error('product not found');
            if (prod.stock < it.quantity) throw new Error('insufficient stock during webhook');
            prod.stock -= it.quantity;
            await prod.save({ session: mongoSession });
        }
        order.status = 'paid';
        await order.save({ session: mongoSession });
        const invoiceUrl = await generateInvoicePdf(order);
        order.invoiceUrl = invoiceUrl;
        await order.save({ session: mongoSession });
        await mongoSession.commitTransaction();
        mongoSession.endSession();
        // optionally send email here
    } catch (err) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        console.error('Transaction error', err);
        return res.status(500).json({ error: err.message });
    }
    }
        res.json({ received: true });
    } catch (err) {
    console.error('Webhook handler error', err);
    res.status(500).json({ error: err.message });
    }
});
module.exports = router;
