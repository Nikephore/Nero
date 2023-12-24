# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production


WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN apk --update add \
    g++ \
    make \
    cmake \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev
    

# Run the application as a non-root user.
USER root
RUN mkdir -p /usr/src/app/node_modules && chown -R node:node /usr/src/app/node_modules


# Copy the rest of the source files into the image.
COPY . .

RUN npm install
USER node

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD node nero.js
