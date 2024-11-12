const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Путь к базе данных
const dbPath = path.resolve(__dirname, 'users.db');

// Открываем базу данных
let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Connected to the users database.');
    }
});

// Чтение данных из базы данных для проверки пользователя
app.get('/users', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).send('Не указан ID пользователя');
    }

    db.get(`SELECT * FROM users WHERE userId = ?`, [userId], (err, row) => {
        if (err) {
            console.error('Ошибка чтения из базы данных:', err.message);
            return res.status(500).send('Ошибка чтения из базы данных');
        }

        if (row) {
            res.send(row);
        } else {
            res.status(404).send('Пользователь не найден');
        }
    });
});

// Добавление нового пользователя
app.post('/add-user', (req, res) => {
    const { userId, admin } = req.body;

    if (!userId) {
        return res.status(400).send('Не указан ID пользователя');
    }

    db.run(`INSERT INTO users(userId, admin) VALUES(?, ?)`, [userId, admin], (err) => {
        if (err) {
            console.error('Ошибка добавления пользователя:', err.message);
            return res.status(500).send('Ошибка добавления пользователя');
        }
        res.send('Пользователь успешно добавлен');
    });
});

// Обслуживание index.html для корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Закрываем базу данных при завершении приложения
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Ошибка при закрытии базы данных:', err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
