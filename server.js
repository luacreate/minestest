const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Новый путь к файлу users.json на диске Render
const USERS_FILE_PATH = path.join('/var/data', 'users.json');

// Инициализация файла users.json на диске при первом запуске
if (!fs.existsSync(USERS_FILE_PATH)) {
    // Создаем директорию /var/data, если она не существует
    fs.mkdirSync('/var/data', { recursive: true });

    // Инициализируем файл users.json с начальными значениями
    const initialData = {
        "123456": {
            "admin": true
        }
    };

    try {
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(initialData, null, 2));
        console.log('Файл users.json успешно инициализирован');
    } catch (err) {
        console.error('Ошибка при инициализации файла users.json:', err);
    }
}

// Чтение данных из JSON-файла
app.get('/users', (req, res) => {
    fs.readFile(USERS_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения файла:', err);
            return res.status(500).send('Ошибка чтения файла');
        }

        try {
            const users = JSON.parse(data);
            console.log('Считанные пользователи:', users); // Лог для проверки содержимого файла users.json
            res.send(users);
        } catch (parseError) {
            console.error('Ошибка парсинга файла users.json:', parseError);
            return res.status(500).send('Ошибка парсинга файла');
        }
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
