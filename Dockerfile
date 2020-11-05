FROM node:14.2.0-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

RUN npm install
RUN npm install typescript sass -g

RUN tsc
RUN sass .:.

CMD npm start
