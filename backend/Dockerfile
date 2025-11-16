FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ bash

COPY package*.json ./
RUN npm install sqlite3 bcrypt

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
