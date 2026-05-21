const express = require('express');
const db = require('../db');
const { laxAuth } = require('../middleware/auth');

const router = express.Router();

function mapOrderItem(row) {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    quantity: row.quantity,
    price: row.price,
    product: {
      id: row.pId,
      name: row.pName,
      description: row.pDescription,
      price: row.pPrice,
      createdAt: row.pCreatedAt,
    },
  };
}

async function getOrderWithItems(id) {
  const order = await db.get(
    `SELECT o.id, o.user_id AS userId, o.total, o.created_at AS createdAt,
            u.id AS uId, u.email AS uEmail
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ?`,
    [id]
  );

  if (!order) {
    return null;
  }

  const rows = await db.all(
    `SELECT oi.id, oi.order_id AS orderId, oi.product_id AS productId, oi.quantity, oi.price,
            p.id AS pId, p.name AS pName, p.description AS pDescription, p.price AS pPrice,
            p.created_at AS pCreatedAt
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [id]
  );

  return {
    id: order.id,
    userId: order.userId,
    total: order.total,
    createdAt: order.createdAt,
    user: {
      id: order.uId,
      email: order.uEmail,
    },
    items: rows.map(mapOrderItem),
  };
}

router.post('/', laxAuth, async (req, res) => {
  if (req.user?.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot create orders' });
  }

  const userId = Number(req.user.sub);

  const cartItems = await db.all(
    `SELECT c.id, c.user_id AS userId, c.product_id AS productId, c.quantity,
            p.price AS productPrice
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = ?`,
    [userId]
  );

  if (cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const total = cartItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);

  const orderInsert = await db.run('INSERT INTO orders (user_id, total) VALUES (?, ?)', [userId, total]);

  for (const item of cartItems) {
    await db.run(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderInsert.id, item.productId, item.quantity, item.productPrice]
    );
  }

  await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

  const order = await getOrderWithItems(orderInsert.id);

  return res.status(201).json({ order });
});

router.get('/', laxAuth, async (req, res) => {
  const userId = Number(req.user.sub);
  const isAdmin = req.user.role === 'admin';

  const rows = isAdmin
    ? await db.all(
        `SELECT id
         FROM orders
         ORDER BY id DESC`
      )
    : await db.all(
        `SELECT id
         FROM orders
         WHERE user_id = ?
         ORDER BY id DESC`,
        [userId]
      );

  const orders = [];
  for (const row of rows) {
    const order = await getOrderWithItems(row.id);
    if (order) {
      orders.push(order);
    }
  }

  return res.json({ orders });
});

router.get('/:id', laxAuth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = Number(req.user.sub);
  const isAdmin = req.user.role === 'admin';
  const order = await getOrderWithItems(id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!isAdmin && order.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json({ order });
});

router.delete('/:id', laxAuth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = Number(req.user.sub);
  const isAdmin = req.user.role === 'admin';
  const order = await getOrderWithItems(id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!isAdmin && order.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await db.run('DELETE FROM orders WHERE id = ?', [id]);
  return res.json({ success: true });
});

module.exports = router;
