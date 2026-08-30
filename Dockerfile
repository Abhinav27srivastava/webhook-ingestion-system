FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies using the lock file
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Run container as non-root user
RUN chown -R node:node /app
USER node

EXPOSE 5000

CMD ["sh", "-c", "node migrate.js && node src/server.js"]