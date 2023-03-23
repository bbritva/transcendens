FROM node:19-alpine3.17

WORKDIR /usr/src/app/

RUN npm install -g @nestjs/cli

CMD npm install && \
npx prisma migrate dev --name init && \
npx prisma generate && \
npx prisma db seed && \
npm run start:debug