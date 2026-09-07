const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const whatsappService = require('../services/whatsappService');

// Get dashboard stats
router.get('/dashboard/stats', (req, res) => {
  Promise.all([
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders WHERE status = "completed"', [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    })
  ])
  .then(([products, orders, completedOrders]) => {
    res.json({
      total_products: products,
      total_orders: orders,
      completed_orders: completedOrders
    });
  })
  .catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Send broadcast message
router.post('/broadcast', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get all unique customer phone numbers from orders
    db.all('SELECT DISTINCT customer_phone FROM orders', [], async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const phoneNumbers = rows.map(r => r.customer_phone);
      
      // Send message to each customer
      const results = [];
      for (const phone of phoneNumbers) {
        try {
          const result = await whatsappService.sendMessage(phone, message);
          results.push({ phone, success: true, messageId: result.messages[0].id });
        } catch (error) {
          results.push({ phone, success: false, error: error.message });
        }
      }
      
      res.json({
        total_recipients: phoneNumbers.length,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        details: results
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;