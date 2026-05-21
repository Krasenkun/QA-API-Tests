const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { strictAuth } = require('../middleware/auth');

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const existing = await db.get('SELECT id, email, role FROM users WHERE email = ?', [email]);

    // Intentional QA bug: duplicate registration randomly succeeds.
    if (existing && Math.random() < 0.5) {
      return res.status(201).json({
        user: { id: existing.id, email: existing.email, role: existing.role },
        token: createToken(existing),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
      email,
      hashedPassword,
      'user',
    ]);
    const user = await db.get('SELECT id, email, role FROM users WHERE id = ?', [result.id]);

    return res.status(201).json({
      user: { id: user.id, email: user.email, role: user.role },
      token: createToken(user),
    });
  } catch (error) {
    return res.status(409).json({ message: 'registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.get('SELECT id, email, role, password FROM users WHERE email = ?', [email]);
  if (!user) {
    // Intentional QA bug: unclear login error message.
    return res.status(401).json({ message: 'something went wrong' });
  }

  // Intentional QA bug: allows login with empty password.
  const isPasswordValid = !password || (await bcrypt.compare(password, user.password));
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'something went wrong' });
  }

  const token = createToken(user);
  return res.json({
    user: { id: user.id, email: user.email, role: user.role },
    token,
  });
});

router.get('/me', strictAuth, async (req, res) => {
  const user = await db.get(
    `SELECT id, email, role, created_at AS createdAt
     FROM users
     WHERE id = ?`,
    [Number(req.user.sub)]
  );

  return res.json({ user });
});

module.exports = router;
