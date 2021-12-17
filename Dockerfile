FROM node:14.2.0-alpine

WORKDIR /app

COPY . .

RUN npm it

RUN npm run build

RUN npm prune --production

CMD npm run start:prod
