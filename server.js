const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Чтение данных из JSON-файла
app.get('/users', (req, res) => {
    fs.readFile(path.join(__dirname, 'public', 'users.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла');
        }
        res.send(JSON.parse(data));
    });
});

// Обновление данных в JSON-файле
app.post('/update-user', (req, res) => {
    const { userId, admin } = req.body;

    fs.readFile(path.join(__dirname, 'public', 'users.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Ошибка чтения файла');
        }

        let users = JSON.parse(data);
        users[userId] = { admin };

        fs.writeFile(path.join(__dirname, 'public', 'users.json'), JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Ошибка сохранения файла');
            }
            res.send('Пользователь успешно обновлен');
        });
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

