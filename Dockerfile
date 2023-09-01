FROM node:alpine AS production

COPY --chown=node:node dist/apps ./dist

RUN apk add --no-cache dumb-init

ENV NODE_ENV production
ENV TZ=Europe/Paris

USER node
EXPOSE 80
CMD ["dumb-init", "node", "dist/api/main.js"]
