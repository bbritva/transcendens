FROM node:alpine


WORKDIR /front
ENV PATH /front/node_modules/.bin:$PATH

COPY package.json ./front
COPY package-lock.json ./front
#RUN npm --prefix ./front install ./front 
# npm install react-scripts@3.4.1 -g 

CMD npm install && npm start