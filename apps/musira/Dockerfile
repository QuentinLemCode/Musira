# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:latest as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm --prefix musira --omit=dev -f install

# Generate the build of the application
RUN npm run build


# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM arm32v6/nginx:alpine

ENV TZ=Europe/Paris

RUN addgroup --system musira && \
          adduser --system -G musira musira

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/party-anniversary /app
COPY nginx.conf /etc/nginx/nginx.conf

RUN chown -R musira:musira ./app

# Expose port 80
EXPOSE 80