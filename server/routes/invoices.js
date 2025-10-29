const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
// simple file-serving route (ensure auth in production)
router.get('/:orderId', async (req, res) => {
try {
const order = await Order.findById(req.params.orderId);
if (!order) return res.status(404).json({ message: 'Order not found' });
if (!order.invoiceUrl) return res.status(404).json({ message: 'Invoice not found' });
// invoiceUrl is like /invoices/invoice_<id>.pdf
res.sendFile(require('path').join(__dirname, '..', order.invoiceUrl));
} catch (err) {
res.status(500).json({ message: err.message });
}
});
module.exports = router;
