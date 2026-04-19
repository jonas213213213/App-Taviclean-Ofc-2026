import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@libsql/client';
import path from 'path';

const db = createClient({
    url: 'file:taviclean.db',
});

async function initDB() {
    await db.execute(`CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        photo TEXT,
        contact TEXT,
        email TEXT,
        address TEXT,
        district TEXT,
        municipality TEXT
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        date TEXT,
        startTime TEXT,
        endTime TEXT,
        customerName TEXT,
        customerPhoto TEXT,
        serviceType TEXT,
        address TEXT,
        city TEXT,
        status TEXT,
        price REAL,
        checklist TEXT,
        contact TEXT,
        email TEXT,
        typology TEXT,
        isSpecial TEXT,
        comment TEXT
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS team (
        id TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        photo TEXT,
        status TEXT
    )`);
    await db.execute(`CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT,
        message TEXT,
        time TEXT,
        unread INTEGER
    )`);
}

async function startServer() {
    await initDB();
    const app = express();
    app.use(express.json());

    // Middleware to normalize .php requests to standard API routes in dev
    app.use('/api', (req, res, next) => {
        if (req.path.endsWith('.php')) {
            req.url = req.url.replace('.php', '');
        }
        next();
    });

    // Customers
    app.get('/api/customers', async (req, res) => {
        const result = await db.execute('SELECT * FROM customers');
        res.json(result.rows);
    });
    app.post('/api/customers', async (req, res) => {
        const { id, name, photo, contact, email, address, district, municipality } = req.body;
        await db.execute({
            sql: 'REPLACE INTO customers (id, name, photo, contact, email, address, district, municipality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: [id, name, photo, contact, email, address, district, municipality]
        });
        res.json({ success: true });
    });
    app.delete('/api/customers', async (req, res) => {
        const id = req.query.id as string;
        await db.execute({ sql: 'DELETE FROM customers WHERE id = ?', args: [id] });
        res.json({ success: true });
    });

    // Appointments
    app.get('/api/appointments', async (req, res) => {
        const result = await db.execute('SELECT * FROM appointments');
        const rows = result.rows.map(row => ({
            ...row,
            checklist: row.checklist ? JSON.parse(row.checklist as string) : [],
            price: Number(row.price)
        }));
        res.json(rows);
    });
    app.post('/api/appointments', async (req, res) => {
        const data = req.body;
        await db.execute({
            sql: 'REPLACE INTO appointments (id, date, startTime, endTime, customerName, customerPhoto, serviceType, address, city, status, price, checklist, contact, email, typology, isSpecial, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            args: [
                data.id, data.date, data.startTime, data.endTime,
                data.customerName, data.customerPhoto, data.serviceType,
                data.address, data.city, data.status, data.price,
                JSON.stringify(data.checklist || []), data.contact, data.email,
                data.typology, data.isSpecial, data.comment
            ]
        });
        res.json({ success: true });
    });
    app.delete('/api/appointments', async (req, res) => {
        const id = req.query.id as string;
        await db.execute({ sql: 'DELETE FROM appointments WHERE id = ?', args: [id] });
        res.json({ success: true });
    });

    // Team
    app.get('/api/team', async (req, res) => {
        const result = await db.execute('SELECT * FROM team');
        res.json(result.rows);
    });
    app.post('/api/team', async (req, res) => {
        const { id, name, role, photo, status } = req.body;
        await db.execute({
            sql: 'REPLACE INTO team (id, name, role, photo, status) VALUES (?, ?, ?, ?, ?)',
            args: [id, name, role, photo, status]
        });
        res.json({ success: true });
    });
    app.delete('/api/team', async (req, res) => {
        const id = req.query.id as string;
        await db.execute({ sql: 'DELETE FROM team WHERE id = ?', args: [id] });
        res.json({ success: true });
    });

    // Notifications
    app.get('/api/notifications', async (req, res) => {
        const result = await db.execute('SELECT * FROM notifications ORDER BY time DESC');
        const rows = result.rows.map(row => ({ ...row, unread: Boolean(row.unread) }));
        res.json(rows);
    });
    app.post('/api/notifications', async (req, res) => {
        const { id, title, message, time, unread } = req.body;
        await db.execute({
            sql: 'REPLACE INTO notifications (id, title, message, time, unread) VALUES (?, ?, ?, ?, ?)',
            args: [id, title, message, time, unread ? 1 : 0]
        });
        res.json({ success: true });
    });

    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    }

    app.listen(3000, '0.0.0.0', () => {
        console.log('Server running on http://localhost:3000');
    });
}

startServer();
