#bin/sh
npm install && \
npx prisma migrate dev --name init && \
npx prisma generate && \
npx prisma db seed && \
npm run start:dev