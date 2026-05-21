const express = require('express');
const db = require('../db');
const { strictAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  const products = await db.all(
    `SELECT id, name, description, price, created_at AS createdAt
     FROM products
     ORDER BY id ASC`
  );
  return res.json({ products });
});

router.get('/:id', async (req, res) => {
  const product = await db.get(
    `SELECT id, name, description, price, created_at AS createdAt
     FROM products
     WHERE id = ?`,
    [Number(req.params.id)]
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json({ product });
});

router.post('/', strictAuth, adminOnly, async (req, res) => {
  const { name, description = '', price } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'name and price are required' });
  }

  // Intentional QA bug: no max length or negative-price validation.
  const result = await db.run('INSERT INTO products (name, description, price) VALUES (?, ?, ?)', [
    name,
    description,
    Number(price),
  ]);
  const product = await db.get(
    `SELECT id, name, description, price, created_at AS createdAt
     FROM products
     WHERE id = ?`,
    [result.id]
  );

  return res.status(201).json({ product });
});

router.put('/:id', strictAuth, adminOnly, async (req, res) => {
  const { name, description, price } = req.body;
  const id = Number(req.params.id);

  const existing = await db.get('SELECT * FROM products WHERE id = ?', [id]);
  if (!existing) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await db.run('UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?', [
    name ?? existing.name,
    description ?? existing.description,
    price !== undefined ? Number(price) : existing.price,
    id,
  ]);

  const product = await db.get(
    `SELECT id, name, description, price, created_at AS createdAt
     FROM products
     WHERE id = ?`,
    [id]
  );

  return res.json({ product });
});

router.delete('/:id', strictAuth, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.get('SELECT id FROM products WHERE id = ?', [id]);

  if (!existing) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await db.run('DELETE FROM products WHERE id = ?', [id]);
  return res.json({ success: true, message: 'Product deleted successfully' });
});

module.exports = router;
