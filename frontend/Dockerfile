# Contexto de build = raiz do repo (docker-compose), porque o front importa
# o firebase-applet-config.json que fica na raiz.

# ============ BUILD ============
FROM node:18-alpine AS build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
COPY firebase-applet-config.json /app/firebase-applet-config.json
RUN npm run build

# ============ SERVE ============
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
