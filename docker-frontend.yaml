FROM node:12.9.1-alpine AS npm

WORKDIR /var/www
COPY package.json package-lock.json ./
RUN npm install

###
FROM node:12.9.1-alpine

WORKDIR /var/www
COPY . .
COPY --from=npm /var/www .

EXPOSE 8080

CMD [ "npm", "run", "serve" ]
