const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const schedule = require("node-schedule");

// 📌 Айди твоего чата (группа или личка)
const CHAT_ID = "120363399343219217@g.us";

// Загружаем все стихи
const verses = JSON.parse(fs.readFileSync("verses.json", "utf8"));
const stateFile = "state.json";

// Функция для получения следующего стиха
function getNextVerseIndex() {
  let state = { index: 0 };

  if (fs.existsSync(stateFile)) {
    state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  }

  let index = state.index;

  // следующий стих
  state.index = (index + 1) % verses.length;

  fs.writeFileSync(stateFile, JSON.stringify(state));

  return index;
}

// Инициализация клиента WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// При первом запуске покажет QR-код для авторизации
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Когда бот готов
client.on("ready", () => {
  console.log("✅ Бот запущен и готов к работе!");

  // CRON: каждый день в 05:00 UTC (09:00 по Еревану)
  schedule.scheduleJob("0 5 * * *", async () => {
    const verseIndex = getNextVerseIndex();
    const verse = verses[verseIndex];
    try {
      await client.sendMessage(CHAT_ID, verse);
      console.log(`📤 Отправлен стих №${verseIndex + 1}`);
    } catch (err) {
      console.error("❌ Ошибка при отправке стиха:", err);
    }
  });
});

// Дополнительно: можно вручную вызвать стих командой "!стих"
client.on("message", async (msg) => {
  if (msg.body.toLowerCase() === "!стих") {
    const verseIndex = getNextVerseIndex();
    const verse = verses[verseIndex];
    await msg.reply(`📖 Сегодняшний стих:\n\n${verse}`);
    console.log(`📤 Отправлен стих по команде №${verseIndex + 1}`);
  }
});

client.initialize();
