# Development stage
FROM node:18 AS development

WORKDIR /app

# Copy prisma schema first
COPY prisma ./prisma/

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Create a startup script
COPY ./scripts/start.sh /start.sh
RUN chmod +x /start.sh

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["/start.sh"]
