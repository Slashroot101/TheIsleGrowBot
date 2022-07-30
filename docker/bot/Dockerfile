FROM node:16

WORKDIR /usr/local

COPY .dev.env ./
COPY package*.json ./
RUN npm install && npm cache clean --force
ENV PATH=/usr/local/node_modules/.bin:$PATH
ENV NODE_ENV=dev
WORKDIR /usr/local/app

COPY src ./src