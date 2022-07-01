FROM node:16.15.1-alpine as builder

WORKDIR /app

COPY . .

RUN yarn

RUN yarn run build

RUN yarn install --production --ignore-scripts --prefer-offline


FROM node:16.15.1-alpine

WORKDIR /app

EXPOSE 3000

COPY package.json .

COPY --from=builder /app /app

CMD ["yarn", "run", "start:prod"]