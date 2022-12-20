FROM node:19.2.0-alpine3.15

WORKDIR /usr/src/app/nestjs_app/my_proj

RUN npm install glob rimraf
RUN npm install prisma --save-dev

RUN npm install --only=development && \
npm i --save @nestjs/config && \
npm i -g @nestjs/cli && \
npm install --save @nestjs/swagger swagger-ui-express
# RUN npx prisma migrate dev --name init && \
RUN npm install @prisma/client
RUN npm install @nestjs/axios
ENTRYPOINT [ "tail", "-f" ]
# ENTRYPOINT [ "npm", "run", "start:dev" ]

# npm run start:dev