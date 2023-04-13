FROM node:18

WORKDIR /action

COPY . .

RUN npm ci

ENTRYPOINT ["/action/entrypoint.sh"]