const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const webhookRoutes = require('./routes/webhook');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Webhook Signature Verification Function
const verifyRequestSignature = (req, res, buf) => {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    throw new Error('Missing signature header - Request rejected');
  }
  
  const hash = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(buf)
    .digest('hex');
  
  const expectedSignature = `sha256=${hash}`;
  
  if (signature !== expectedSignature) {
    throw new Error('Invalid signature - Request rejected');
  }
};

// Apply signature verification to webhook
app.use('/webhook', bodyParser.json({ 
  verify: verifyRequestSignature 
}));

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    app: process.env.APP_NAME,
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(403).json({
    error: 'Forbidden',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Enda Primsa App is running on port ${PORT}`);
  console.log(`📱 WhatsApp Webhook: http://localhost:${PORT}/webhook`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health\n`);
});

module.exports = app;