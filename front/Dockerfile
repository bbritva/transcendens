FROM node:alpine

WORKDIR ./

ENV PATH ./node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm install && npm install react-scripts@3.4.1 -g 
COPY . ./

CMD ["npm", "start"]