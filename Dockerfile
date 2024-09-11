FROM node:20.17.0

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY . .

RUN npm install

RUN npx prisma generate

ENV DATABASE_URL=mysql://root:test123@host.docker.internal:3306/kynan


RUN npm run build

CMD ["npm", "run", "start"]
