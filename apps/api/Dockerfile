FROM node:19-alpine

RUN apk add --no-cache dumb-init

ENV NODE_ENV production
ENV TZ=Europe/Paris

WORKDIR /app

COPY dist/apps/api ./apps/api
COPY dist/libs ./libs

USER node
EXPOSE 80
CMD ["dumb-init", "node", "dist/apps/api/src/main.js"]
