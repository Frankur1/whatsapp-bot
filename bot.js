const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const schedule = require("node-schedule");

// айди чата
const CHAT_ID = "120363399343219217@g.us";

// читаем все стихи из json
const verses = JSON.parse(fs.readFileSync("verses.json", "utf8"));

// файл для хранения текущего дня
const stateFile = "state.json";

// функция получить индекс стиха
function getNextVerseIndex() {
  let state = { index: 0 };

  if (fs.existsSync(stateFile)) {
    state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  }

  // получаем индекс
  let index = state.index;

  // увеличиваем на следующий раз
  state.index = (index + 1) % verses.length; // если кончатся — начнёт заново

  // сохраняем
  fs.writeFileSync(stateFile, JSON.stringify(state));

  return index;
}

// клиент whatsapp
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Бот запущен и готов!");

  // расписание на каждый день в 09:00
  schedule.scheduleJob("0 9 * * *", async () => {
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

client.initialize();
