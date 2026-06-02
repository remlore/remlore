# Stage 1: Build Angular
FROM node:22-alpine AS angular-builder
WORKDIR /apps/rem-ids-fe
COPY rem-ids-fe/package*.json ./
RUN npm ci
COPY rem-ids-fe/ ./
RUN npm run build

# Stage 2: Build NestJS
FROM node:22-alpine AS nest-builder
WORKDIR /apps/rem-ids
COPY rem-ids/package*.json ./
RUN npm ci
COPY rem-ids/ ./
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:22-alpine
WORKDIR /app

# Copy NestJS build
COPY --from=nest-builder /apps/rem-ids/dist ./dist
COPY --from=nest-builder /apps/rem-ids/node_modules ./node_modules
COPY --from=nest-builder /apps/rem-ids/prisma ./prisma
COPY --from=nest-builder /apps/rem-ids/package*.json ./

# Copy Angular build to public folder
COPY --from=angular-builder /apps/rem-ids-fe/dist/browser ./public

ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "dist/main"]