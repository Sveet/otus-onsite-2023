FROM oven/bun:1.0.3
WORKDIR /usr/src/app
COPY package.json ./
COPY bun.lockb ./

RUN bun i --frozen-lockfile

COPY *.json ./
COPY ./src ./src
COPY ./public ./public

CMD ["bun", "start"]
EXPOSE 3000