FROM node:16 as builder

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./

RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

RUN rm -rf ./src
RUN rm -rf ./node_modules

RUN npm ci --legacy-peer-deps --only=production --silent

RUN npm i prisma
RUN npx prisma generate

FROM node:16-slim

RUN apt-get update && apt-get install openssl -y

COPY --from=builder /app /app
WORKDIR /app

CMD [ "node", "." ]