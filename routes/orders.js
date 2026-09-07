const express = require('express');
const router = express.Router();
const db = require('../utils/database');

// Get all orders
router.get('/', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Get order by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(row);
  });
});

// Create order
router.post('/', (req, res) => {
  const { customer_phone, customer_name, items, total_price, status } = req.body;
  
  if (!customer_phone || !items || !total_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const query = 'INSERT INTO orders (customer_phone, customer_name, items, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [customer_phone, customer_name || 'Customer', JSON.stringify(items), total_price, status || 'pending', new Date()];
  
  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      message: 'Order created successfully'
    });
  });
});

// Update order status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order updated successfully' });
  });
});

module.exports = router;