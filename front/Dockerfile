FROM node:19.2.0-alpine3.15


WORKDIR /front

ENV PATH /front/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./

CMD npm install && npm start