# используем официальный Node.js
FROM node:22-alpine

# рабочая директория внутри контейнера
WORKDIR /app

# копируем package.json и package-lock.json
COPY package*.json ./

# ставим зависимости
RUN npm install

# копируем весь код
COPY . .

# запускаем бота
CMD ["npm", "start"]
