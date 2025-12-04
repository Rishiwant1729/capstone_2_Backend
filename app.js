import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import authRoutes from "./src/routes/authRoutes.js";
import bookRoutes from "./src/routes/bookRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("src/uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

export default app;

