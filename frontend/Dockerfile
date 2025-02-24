FROM node:22-alpine as build-stage

WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies with frozen lockfile (ensures reliability)
RUN pnpm install --frozen-lockfile

# Clean cache and ensure vite is explicitly installed
RUN pnpm cache clean
RUN pnpm add vite@latest --save-dev
RUN ls -la node_modules/vite || echo "vite not found"
RUN find node_modules -name "vite.js" || echo "vite.js not found"

# Verify npm-run-all2 is installed and list installed packages
RUN ls -la node_modules/npm-run-all2 || echo "npm-run-all2 not found"
RUN pnpm list | grep npm-run-all2

# Copy the rest of the application
COPY . .

# Build using pnpm exec instead of npx
RUN pnpm exec vite build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy the built files from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Remove the default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Add nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 