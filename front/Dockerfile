FROM node:alpine

WORKDIR /front

ENV PATH /front/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm install
# npm install react-scripts@3.4.1 -g 

CMD ["npm", "start"]