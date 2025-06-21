# Use an official node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json package-lock.json files to the container
COPY package*.json .


# Install the Dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Export th eport that the app runs on
EXPOSE 5003

# Define the command to run your application
CMD ["node", "./src/server.js"]

