# Etapa de construcción
FROM node:22.3.0 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa de ejecución
FROM node:22.3.0
WORKDIR /app
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static


# Exponer el puerto 3000
EXPOSE 3000

# Definir variables de entorno
ENV PORT 3000
ENV NODE_ENV production

# Ejecutar la aplicación
CMD ["node", "server.js"]

