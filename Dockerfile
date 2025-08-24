FROM node:lts
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN npx prisma db push
CMD ["node", "dist/index.js"]