FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY requirements.txt package.json ./
RUN npm install $(cat requirements.txt | tr '\n' ' ')

# Copy remaining app files
COPY . .

# Make start.sh executable
RUN chmod +x start.sh

# Start script - use sh instead of bash (alpine doesn't have bash)
CMD ["sh", "./start.sh"]
