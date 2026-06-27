# frontend/Dockerfile
FROM node:14

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-optional

COPY . ./
RUN npm run build

EXPOSE 3000

CMD ["node", "static-server.js"]
