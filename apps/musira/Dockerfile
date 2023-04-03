# Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:alpine
FROM --platform=linux/arm32v6 arm32v6/nginx:alpine

ENV TZ=Europe/Paris

# Copy the build output to replace the default nginx contents.
COPY dist/apps/musira /app
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80