# Build prod

# TODO : stop building it here, use a CI/CD pipeline instead
FROM node:alpine AS build

RUN apk add --update python3 make g++

WORKDIR /app

COPY --chown=node:node . .
RUN npm i

RUN npm run build:prod

ENV NODE_ENV production

RUN npm ci --only=production --ignore-scripts && npm cache clean --force

USER node

# Prod

FROM node:alpine AS production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist/apps ./dist

RUN apk add --no-cache dumb-init

ENV NODE_ENV production
ENV TZ=Europe/Paris

USER node
EXPOSE 80
CMD ["dumb-init", "node", "dist/api/main.js"]
