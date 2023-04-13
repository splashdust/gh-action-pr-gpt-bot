FROM node:lts

COPY package*.json ./
RUN npm ci

COPY . .

RUN chmod +x entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]