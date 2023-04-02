FROM node:19-alpine3.16 as builder

ENV NODE_ENV build

WORKDIR /app

COPY package*.json ./
RUN npm --prefix api --omit=dev -f install
COPY . /app
RUN npm run build \
    && npm prune --production

# ---

FROM arm32v6/node:16-alpine3.14

ENV NODE_ENV production
ENV TZ=Europe/Paris

USER node
WORKDIR /app
RUN addgroup --system api && \
          adduser --system -G api api

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY --from=builder /app/dist/ /app/dist/

RUN chown -R api:api .

CMD ["node", "dist/main.js"]
EXPOSE 80