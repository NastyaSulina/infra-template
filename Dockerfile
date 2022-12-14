FROM node:16
WORKDIR /app

COPY . .
RUN npm ci
RUN npm run build

CMD npm start