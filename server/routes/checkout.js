const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Product = require('../models/Product');
const Order = require('../models/Order');

router.post('/', async (req, res) => {
    try {
        const { userId, items = [], shipping = 0, currency = 'usd' } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ message:'no items' });
        let subtotal = 0;
        const line_items = [];
        const orderItems = [];
        for (const it of items) {
        const p = await Product.findById(it.productId);
        if (!p) return res.status(400).json({ message: 'product not found' });
        if (p.stock < it.quantity) return res.status(400).json({ message:
        `Insufficient stock for ${p.name}` });
        const price = p.price; // cents
        subtotal += price * it.quantity;
        line_items.push({
        price_data: {
        currency,
        product_data: { name: p.name },
        unit_amount: price,
        },
        quantity: it.quantity,
        });
        orderItems.push({ productId: p._id, name: p.name, price, quantity:it.quantity });
        }
        const tax = 0;
        const total = subtotal + shipping + tax;
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success?
        session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
        metadata: { userId: String(userId) },
        });
        const order = new Order({ userId, items: orderItems, subtotal, shipping,
        tax, total, currency, status:'pending', paymentIntentId: session.payment_intent
        || session.id });
        await order.save();
        res.json({ sessionId: session.id, orderId: order._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
}
});
module.exports = router;
