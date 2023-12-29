FROM node:alpine AS production

COPY --chown=node:node dist ./dist
COPY --chown=node:node node_modules ./node_modules

RUN apk add --no-cache dumb-init

ENV NODE_ENV production
ENV TZ=Europe/Paris

USER node
EXPOSE 80
CMD ["dumb-init", "node", "dist/api/src/main.js"]
