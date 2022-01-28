FROM node:12.9.1-alpine AS builder
WORKDIR /var/www
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
RUN printenv | npm run build
CMD ["npm", "run", "serve"]
EXPOSE 8080

FROM nginxinc/nginx-unprivileged:1.20-alpine as nginx
COPY --chown=101 --from=builder /var/www .
