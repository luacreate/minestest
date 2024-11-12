const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Пул подключений к базе данных PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Создание таблицы пользователей при старте сервера
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        userId TEXT PRIMARY KEY,
        admin BOOLEAN
    )
`).then(() => {
    console.log('Таблица пользователей проверена или создана.');
}).catch((err) => {
    console.error('Ошибка создания таблицы пользователей:', err);
});

// Чтение данных из базы данных для проверки пользователя
app.get('/users', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).send('Не указан ID пользователя');
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE userId = $1', [userId]);
        if (result.rows.length > 0) {
            res.send(result.rows[0]);
        } else {
            res.status(404).send('Пользователь не найден');
        }
    } catch (err) {
        console.error('Ошибка чтения из базы данных:', err.message);
        res.status(500).send('Ошибка чтения из базы данных');
    }
});

// Добавление нового пользователя
app.post('/add-user', async (req, res) => {
    const { userId, admin } = req.body;

    if (!userId) {
        return res.status(400).send('Не указан ID пользователя');
    }

    try {
        await pool.query('INSERT INTO users (userId, admin) VALUES ($1, $2) ON CONFLICT (userId) DO NOTHING', [userId, admin]);
        res.send('Пользователь успешно добавлен');
    } catch (err) {
        console.error('Ошибка добавления пользователя:', err.message);
        res.status(500).send('Ошибка добавления пользователя');
    }
});

// Обслуживание index.html для корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
