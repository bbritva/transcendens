#bin/sh

npx prisma migrate dev --name init 
prisma generate 
npm run start:dev