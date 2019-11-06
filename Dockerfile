FROM node:12

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG PORT=8000
ENV PORT $PORT

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .
RUN npm run clean
RUN npm run build

USER node
CMD [ "node", "./build/index.js" ]
