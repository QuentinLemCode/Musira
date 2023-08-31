# Build prod
FROM node:alpine AS build

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .

RUN npm run build:prod

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node

# Prod

FROM node:alpine AS production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

RUN apk add --no-cache dumb-init

ENV NODE_ENV production
ENV TZ=Europe/Paris

WORKDIR /app

COPY dist/apps/api .

USER node
EXPOSE 80
CMD ["dumb-init", "node", "dist/main.js"]