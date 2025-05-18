# Build stage
FROM node:18.19.0-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 8000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]
