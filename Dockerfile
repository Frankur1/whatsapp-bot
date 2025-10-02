FROM node:22-slim

# Устанавливаем системные библиотеки для Chromium
RUN apt-get update && apt-get install -y \
  wget gnupg ca-certificates fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 \
  libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils libgbm-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Сначала копируем package.json — чтобы npm install кешировался
COPY package*.json ./

RUN npm install

# Потом копируем весь проект
COPY . .

# 🚀 Запускаем напрямую Node, минуя npm start
CMD ["node", "bot.js"]
