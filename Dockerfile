FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python & Playwright dependencies (cached if requirements.txt unchanged)
COPY requirements.txt .
RUN npm install $(cat requirements.txt | tr '\n' ' ')

# Install Playwright separately and cache it
RUN npx playwright install --with-deps

# Copy remaining app files (only triggers rebuild if files changed)
COPY . .

# Start script
CMD ["bash", "-c", "./start.sh"]
