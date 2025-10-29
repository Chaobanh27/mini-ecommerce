const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: String },
        items: [{
        productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        }],
        subtotal: Number,
        shipping: Number,
        tax: Number,
        total: Number,
        currency: { type: String, default: 'usd' },
        status: { 
            type: String, 
            enum: ['pending','paid','fulfilled','cancelled','refunded'], 
            default: 'pending' 
        },
        paymentIntentId: String,
        invoiceUrl: String,
    }, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);