FROM node:24-alpine AS base

ENV TZ=Europe/Paris
WORKDIR /app

# ----------------------------------------
# Install production dependencies (for runtime)
# ----------------------------------------
FROM base AS deps
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev \
  && apk del .build-deps

# ----------------------------------------
# Install all dependencies and build (dev + prod)
# ----------------------------------------
FROM base AS build
RUN apk add --no-cache --virtual .build-deps python3 make g++
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build \
  && apk del .build-deps

# ----------------------------------------
# Runtime image
# ----------------------------------------
FROM node:24-alpine AS runtime

ENV NODE_ENV=production
ENV TZ=Europe/Paris
WORKDIR /app

# Minimal init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy only what is needed to run
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node
EXPOSE 3020
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
