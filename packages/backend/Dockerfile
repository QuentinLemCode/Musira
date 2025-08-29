FROM node:20-alpine

ENV NODE_ENV=production
ENV TZ=Europe/Paris

WORKDIR /app

# Install runtime deps for the backend only
COPY packages/backend/package*.json ./
RUN npm ci --omit=dev

# Copy compiled dist from the monorepo (built in CI before docker build)
COPY packages/backend/dist ./dist

EXPOSE 3020
CMD ["node", "dist/main.js"]
