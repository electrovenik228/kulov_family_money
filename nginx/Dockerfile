FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
