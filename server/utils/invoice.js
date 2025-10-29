const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
async function generateInvoicePdf(order) {
const filename = `invoice_${order._id}.pdf`;
const outDir = path.join(__dirname, '..', 'invoices');
await fs.promises.mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, filename);
return new Promise((resolve, reject) => {
const doc = new PDFDocument({ size: 'A4', margin: 40 });
const stream = fs.createWriteStream(outPath);
doc.pipe(stream);
doc.fontSize(20).text('INVOICE', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text(`Order ID: ${order._id}`);
doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
doc.text(`Status: ${order.status}`);
doc.moveDown();
doc.text('Items:');
order.items.forEach(it => {
doc.text(`${it.name} x${it.quantity} - ${(it.price/100).toFixed(2)} $
{order.currency}`);
});
doc.moveDown();
doc.text(`Subtotal: ${(order.subtotal/100).toFixed(2)} ${order.currency}`);
doc.text(`Shipping: ${(order.shipping/100).toFixed(2)} ${order.currency}`);
doc.text(`Tax: ${(order.tax/100).toFixed(2)} ${order.currency}`);
doc.text(`Total: ${(order.total/100).toFixed(2)} ${order.currency}`);
doc.end();
stream.on('finish', () => resolve(`/invoices/${filename}`));
stream.on('error', reject);
});
}
module.exports = { generateInvoicePdf };