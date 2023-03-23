FROM node:19-alpine3.17

WORKDIR /front

ENV PATH /front/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./

CMD npm install && npm start
# CMD npm install -g serve && npm run build && serve -s build -p 3001