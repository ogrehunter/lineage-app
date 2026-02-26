# Use lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of source code
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]

