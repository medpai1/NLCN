# Web/Dockerfile

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY Web_Frontend/package.json ./
RUN npm install --no-audit --no-fund
COPY Web_Frontend/ .
RUN npm run build

# 2) Serve stage
FROM nginx:1.25-alpine
COPY Web_Frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
