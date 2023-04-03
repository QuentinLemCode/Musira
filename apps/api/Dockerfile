FROM node:19-alpine

ENV NODE_ENV production
ENV TZ=Europe/Paris

WORKDIR /app

COPY dist/apps/api .

USER node
EXPOSE 80
CMD ["node", "dist/main.js"]