// server/index.ts

import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import path from "path";
import { registerRoutes } from "./routes.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// A simple logger to replace the one from the vite file
const log = (message: string) => {
  console.log(`[server] ${message}`);
};

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // --- CRITICAL CHANGE ---
  // Only import and set up Vite in development mode.
  // In production, serve the pre-built static files.
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // Construct path to the built client assets
    const publicPath = path.resolve(process.cwd(), "./dist/public");
    
    app.use(express.static(publicPath));
    
    // For any request that doesn't match an API route or a static file,
    // send back the main index.html file.
    app.get("*", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server listening on port ${port}`);
  });
})();