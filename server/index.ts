// server/index.ts - (Ensure it looks like this)

import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import path from "path";
import { registerRoutes } from "./routes.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

  if (process.env.NODE_ENV === "development") {
    // This block will now be removed by esbuild during the build
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // --- START: REPLACEMENT FOR PRODUCTION LOGIC ---

    const publicPath = path.resolve(process.cwd(), "./dist/public");
    const spaRouter = express.Router();

    // The spaRouter will handle serving all static files (JS, CSS, images)
    spaRouter.use(express.static(publicPath));
    
    // The spaRouter's catch-all will serve the index.html for any sub-route
    spaRouter.get("/*", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });

    // Mount the entire single-page application router on its specific sub-path
    app.use('/gen_ai_poc/final_llm_api', spaRouter);

    // --- END: REPLACEMENT FOR PRODUCTION LOGIC ---
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server listening on port ${port}`);
  });
})();
