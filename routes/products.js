const express = require('express');
const router = express.Router();
const db = require('../utils/database');

// Get all products
router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(row);
  });
});

// Create product (admin only)
router.post('/', (req, res) => {
  const { name, description, price, image_url, category } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  
  const query = 'INSERT INTO products (name, description, price, image_url, category, created_at) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [name, description || '', price, image_url || '', category || 'General', new Date()];
  
  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      message: 'Product created successfully'
    });
  });
});

// Update product (admin only)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category } = req.body;
  
  const query = 'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?';
  const params = [name, description, price, image_url, category, id];
  
  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// Delete product (admin only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;