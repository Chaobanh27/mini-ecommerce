const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: String,
        sku: String,
        price: { type: Number, required: true }, // cents
        currency: { type: String, default: 'usd' },
        stock: { type: Number, default: 0 },
        images: [String],
        description: String,
    }, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);