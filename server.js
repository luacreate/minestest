const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname))); // Раздача всех статических файлов из корня

// Новый путь к файлу users.json на диске Render
const USERS_FILE_PATH = path.join('/var/data', 'users.json');

// Инициализация файла users.json на диске при первом запуске
if (!fs.existsSync(USERS_FILE_PATH)) {
    // Создаем директорию /var/data, если она не существует
    fs.mkdirSync('/var/data', { recursive: true });
    // Создаем пустой файл users.json
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify({}));
}

// Чтение данных из JSON-файла
app.get('/users', (req, res) => {
    fs.readFile(USERS_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла');
        }
        res.send(JSON.parse(data));
    });
});

// Обновление данных в JSON-файле
app.post('/update-user', (req, res) => {
    const { userId, admin } = req.body;

    fs.readFile(USERS_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла');
        }

        let users = JSON.parse(data);
        users[userId] = { admin };

        fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка сохранения файла');
            }
            res.send('Пользователь успешно обновлен');
        });
    });
});

// Добавление нового пользователя в JSON-файл
app.post('/add-user', (req, res) => {
    const { userId, admin } = req.body;

    fs.readFile(USERS_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла');
        }

        let users = JSON.parse(data);
        if (users[userId]) {
            return res.status(400).send('Пользователь с таким ID уже существует');
        }

        users[userId] = { admin };

        fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка сохранения файла');
            }
            res.send('Пользователь успешно добавлен');
        });
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
