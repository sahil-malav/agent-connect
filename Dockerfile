# ---------- Build Stage ----------
    FROM node:20 AS build
    WORKDIR /app
    
    # Dependencies for build (dev deps included)
    COPY package*.json ./
    RUN npm install
    
    # App source
    COPY . .
    
    # Build client (Vite) + server (esbuild)
    RUN npm run build
    
    
    # ---------- Runtime Stage ----------
    FROM node:20-alpine AS runtime
    WORKDIR /app
    
    # Only production dependencies
    COPY package*.json ./
    RUN npm install --omit=dev
    
    # Bring in built server artefacts from the build stage
    COPY --from=build /app/dist ./dist
    
    # --- CRITICAL CHANGE ---
    # Bring in built CLIENT artefacts from the correct location
    COPY --from=build /app/dist/public ./dist/public
    
    # Expose the app port (defaults to 5000)
    EXPOSE 5000
    
    # Start (serves API + static client)
    CMD ["npm", "start"]