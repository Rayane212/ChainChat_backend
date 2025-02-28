FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl openssl-dev

RUN npm install -g pnpm@latest

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile  

COPY . .

RUN pnpx prisma generate

RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "start"]