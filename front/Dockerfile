FROM node:19.2.0-alpine3.15


WORKDIR /front
ENV PATH /front/node_modules/.bin:$PATH

# RUN npm --prefix /front install  
COPY package.json ./
COPY package-lock.json ./
# RUN npm install
# npm install react-scripts@3.4.1 -g 

CMD npm install && npm start