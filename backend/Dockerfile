# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# Create uploads directory with subfolders
RUN mkdir -p /app/uploads/hero /app/uploads/fields /app/uploads/tools /app/uploads/partners /app/uploads/socials

EXPOSE 8000

CMD ["node", "dist/index.js"]
