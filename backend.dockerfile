# Use official Node.js base image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema folder
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 4000

# Start the app
CMD ["npm", "start"] 
