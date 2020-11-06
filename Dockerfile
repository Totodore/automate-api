FROM node:14.2.0-alpine

WORKDIR /app

COPY . .

EXPOSE 3000

RUN npm install
RUN npm install typescript sass -g

RUN tsc
RUN sass .:.

RUN echo | ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'

CMD npm start
