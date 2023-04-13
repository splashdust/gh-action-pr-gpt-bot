FROM node:18

WORKDIR /github/workspace

COPY . .

RUN npm ci

ENTRYPOINT ["node", "./index.mjs"]