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

# pdftoppm renders the first PDF page into the public resource cover.
RUN apk add --no-cache poppler-utils

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# Create uploads directory with subfolders
RUN mkdir -p /app/uploads/hero /app/uploads/fields /app/uploads/tools /app/uploads/partners /app/uploads/socials /app/uploads/news /app/uploads/thematics /app/uploads/projects /app/uploads/project-results /app/uploads/team /app/uploads/resources/files /app/uploads/resources/covers

EXPOSE 8000

CMD ["node", "dist/index.js"]
