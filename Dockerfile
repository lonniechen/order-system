# Define Node
FROM node:12-alpine

# Define working directory
WORKDIR /app

# Copy package.json and package-lock.json to working directory
COPY package.json package-lock.json ./

# Install node_modules dependencies
RUN npm i

# Copy the rest of the file, excluding those defined in .dockerignore
COPY . .

# Run the app
CMD ["npm", "start"]