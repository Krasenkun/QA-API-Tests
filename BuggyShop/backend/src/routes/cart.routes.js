const express = require('express');
const db = require('../db');
const { laxAuth } = require('../middleware/auth');

const router = express.Router();

function rejectAdmin(req, res, next) {
  if (req.user?.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot use cart endpoints' });
  }

  return next();
}

function mapCartItem(row) {
  return {
    id: row.id,
    userId: row.userId,
    productId: row.productId,
    quantity: row.quantity,
    product: {
      id: row.pId,
      name: row.pName,
      description: row.pDescription,
      price: row.pPrice,
      createdAt: row.pCreatedAt,
    },
  };
}

async function getCartItemWithProduct(itemId) {
  const row = await db.get(
    `SELECT c.id, c.user_id AS userId, c.product_id AS productId, c.quantity,
            p.id AS pId, p.name AS pName, p.description AS pDescription, p.price AS pPrice,
            p.created_at AS pCreatedAt
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.id = ?`,
    [itemId]
  );

  return row ? mapCartItem(row) : null;
}

router.get('/', laxAuth, rejectAdmin, async (req, res) => {
  const userId = Number(req.user.sub);
  const rows = await db.all(
    `SELECT c.id, c.user_id AS userId, c.product_id AS productId, c.quantity,
            p.id AS pId, p.name AS pName, p.description AS pDescription, p.price AS pPrice,
            p.created_at AS pCreatedAt
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = ?
     ORDER BY c.id ASC`,
    [userId]
  );
  const items = rows.map(mapCartItem);

  return res.json({ items });
});

router.post('/items', laxAuth, rejectAdmin, async (req, res) => {
  const userId = Number(req.user.sub);
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }

  // Intentional QA bug: quantity 0 is accepted.
  const parsedQuantity = Number(quantity ?? 1);

  const existing = await db.get(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, Number(productId)]
  );

  let item;
  if (existing) {
    await db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [
      existing.quantity + parsedQuantity,
      existing.id,
    ]);
    item = await getCartItemWithProduct(existing.id);
  } else {
    const result = await db.run(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [userId, Number(productId), parsedQuantity]
    );
    item = await getCartItemWithProduct(result.id);
  }

  return res.status(201).json({ item });
});

router.put('/items/:id', laxAuth, rejectAdmin, async (req, res) => {
  const userId = Number(req.user.sub);
  const itemId = Number(req.params.id);
  const { quantity } = req.body;

  const item = await db.get('SELECT id, user_id AS userId FROM cart_items WHERE id = ?', [itemId]);
  if (!item || item.userId !== userId) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  await db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [Number(quantity), itemId]);
  const updated = await getCartItemWithProduct(itemId);

  return res.json({ item: updated });
});

router.delete('/items/:id', laxAuth, rejectAdmin, async (req, res) => {
  const userId = Number(req.user.sub);
  const itemId = Number(req.params.id);

  const item = await db.get('SELECT id, user_id AS userId FROM cart_items WHERE id = ?', [itemId]);
  if (!item || item.userId !== userId) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  await db.run('DELETE FROM cart_items WHERE id = ?', [itemId]);
  return res.json({ success: true });
});

module.exports = router;
