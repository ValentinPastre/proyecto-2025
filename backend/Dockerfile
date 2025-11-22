FROM node:20

WORKDIR /app
RUN mkdir -p /app/data

COPY package*.json ./backend/
RUN npm install --prefix backend

COPY . .

EXPOSE 3000

CMD ["npm", "start"]