```bash
# mount containers
docker-compose up -d
# install dependencies
npm install
# push db
npx prisma db push
# seed database
npx ts-node prisma/seed.ts
# start app
npm run dev
```
