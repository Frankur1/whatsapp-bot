const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');   // для сохранения QR как png
const fs = require('fs');
const cron = require('node-cron');

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

// Сохраняем QR-код в файл
client.on('qr', async (qr) => {
    console.log("📥 QR получен! Сохраняю в qr.png...");
    try {
        await qrcode.toFile('qr.png', qr);
        console.log("✅ Файл qr.png сохранён! Скачай его в Railway → Files");
    } catch (err) {
        console.error("❌ Ошибка при сохранении QR:", err);
    }
});

// Когда бот подключён
client.on('ready', () => {
    console.log('✅ Бот подключён к WhatsApp!');
});

// Индекс для стихов
let dayIndex = 0;

// CRON на 09:00 каждый день
cron.schedule('0 9 * * *', async () => {
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

client.initialize();
