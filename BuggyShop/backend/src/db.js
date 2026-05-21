const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function onRun(error) {
			if (error) {
				reject(error);
				return;
			}

			resolve({ id: this.lastID, changes: this.changes });
		});
	});
}

function get(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (error, row) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(row || null);
		});
	});
}

function all(sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (error, rows) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(rows);
		});
	});
}

async function init() {
	await run('PRAGMA foreign_keys = ON');

	await run(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'user',
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);

	await run(`
		CREATE TABLE IF NOT EXISTS products (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT NOT NULL,
			price REAL NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);

	await run(`
		CREATE TABLE IF NOT EXISTS cart_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			product_id INTEGER NOT NULL,
			quantity INTEGER NOT NULL,
			UNIQUE(user_id, product_id),
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
		)
	`);

	await run(`
		CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			total REAL NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`);

	await run(`
		CREATE TABLE IF NOT EXISTS order_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			order_id INTEGER NOT NULL,
			product_id INTEGER NOT NULL,
			quantity INTEGER NOT NULL,
			price REAL NOT NULL,
			FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
			FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
		)
	`);

	const userCountRow = await get('SELECT COUNT(*) AS count FROM users');
	if ((userCountRow?.count || 0) === 0) {
		const adminPass = await bcrypt.hash('admin123', 10);
		const userPass = await bcrypt.hash('user123', 10);

		await run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
			'admin@buggyshop.local',
			adminPass,
			'admin',
		]);

		await run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [
			'user@buggyshop.local',
			userPass,
			'user',
		]);
	}

	const productCountRow = await get('SELECT COUNT(*) AS count FROM products');
	if ((productCountRow?.count || 0) === 0) {
		await run('INSERT INTO products (name, description, price) VALUES (?, ?, ?)', [
			'Laptop Sleeve',
			'13-inch fabric sleeve',
			29.99,
		]);
		await run('INSERT INTO products (name, description, price) VALUES (?, ?, ?)', [
			'Wireless Mouse',
			'Ergonomic and silent click',
			19.49,
		]);
		await run('INSERT INTO products (name, description, price) VALUES (?, ?, ?)', [
			'Mechanical Keyboard',
			'Red switch full-size keyboard',
			79.0,
		]);
	}
}

module.exports = {
	run,
	get,
	all,
	init,
};
