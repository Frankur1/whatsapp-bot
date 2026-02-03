const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');   // генерируем QR
const fs = require('fs');
const cron = require('node-cron');
const express = require('express');

// Загружаем стихи
const verses = require('./verses.json');

// ID твоего чата
const chatId = "120363399343219217@g.us";

// Настройка WhatsApp клиента
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    },
});

// Express-сервер для показа QR
const app = express();
let qrImagePath = null;

// Когда приходит QR-код → сохраняем как qr.png
client.on('qr', async (qr) => {
    console.log("📥 QR получен! Доступен по /qr.png");
    try {
        qrImagePath = __dirname + '/qr.png';
        await qrcode.toFile(qrImagePath, qr);
    } catch (err) {
        console.error("❌ Ошибка при сохранении QR:", err);
    }
});

// Роут для выдачи QR-кода
app.get('/qr.png', (req, res) => {
    if (qrImagePath && fs.existsSync(qrImagePath)) {
        res.sendFile(qrImagePath);
    } else {
        res.status(404).send("QR ещё не сгенерирован");
    }
});

// Когда бот подключён
client.on('ready', () => {
    console.log('✅ Бот подключён к WhatsApp!');
});

// Индекс для стихов
let dayIndex = 0;

// CRON на 10:00 каждый день
cron.schedule('0 8 * * *', async () => {
    if (dayIndex >= verses.length) {
        dayIndex = 0; // начинаем заново
    }

    const verse = verses[dayIndex];
    try {
        await client.sendMessage(chatId, verse);
        console.log("📖 Отправлен стих:", verse);
    } catch (err) {
        console.error("❌ Ошибка при отправке стиха:", err);
    }

    dayIndex++;
});

// Запуск клиента и сервера
client.initialize();
app.listen(process.env.PORT || 3000, () => {
    console.log("🌍 Сервер запущен. QR доступен по /qr.png");
});
