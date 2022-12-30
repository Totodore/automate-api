FROM node:18-alpine as builder

WORKDIR /app

COPY . .

RUN yarn

RUN yarn run build

RUN yarn install --production --ignore-scripts --prefer-offline


FROM node:18-alpine

WORKDIR /app

EXPOSE 3000

COPY package.json .

COPY --from=builder /app /app

RUN apk update && \
	apk upgrade -U && \
	apk add ca-certificates ffmpeg && \
	rm -rf /var/cache/* \
	echo "http://dl-cdn.alpinelinux.org/alpine/v3.3/main" >> /etc/apk/repositories \
	apk add --no-cache libwebp libwebp-tools \
	mkdir -p /data/tmp

CMD ["yarn", "run", "start:prod"]