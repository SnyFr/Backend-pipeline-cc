import express from "express";
import cors from "cors";
import sendResponse from "./utils/response.js";
import authRoutes from "./routes/authRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import checklistRoutes from "./routes/checklistRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Health Check
app.get("/", (req, res) => {
  return sendResponse(res, 200, true, "Creator Content & Pipeline Tracker API is running!");
});

// Mount Routes (API Specification v1)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/channels", channelRoutes);
app.use("/api/v1/contents", contentRoutes);
app.use("/api/v1/checklists", checklistRoutes);

// 404 Route Not Found Handler
app.use((req, res) => {
  return sendResponse(res, 404, false, `Endpoint ${req.originalUrl} not found`);
});

// Central Global Error Handler (mencegah unhandled error crash & data leak)
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  return sendResponse(res, statusCode, false, message);
});

export default app;