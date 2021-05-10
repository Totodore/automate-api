FROM node:14.2.0-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

VOLUME [ "/data" ]

CMD npm run start:prod
