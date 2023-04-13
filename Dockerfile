FROM node:18

WORKDIR /action

COPY package*.json ./
RUN npm ci

COPY . .

RUN chmod +x entrypoint.sh

ENTRYPOINT ["/action/entrypoint.sh"]