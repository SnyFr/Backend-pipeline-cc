import express from "express";
import {
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";
import { addChecklist } from "../controllers/checklistController.js";
import { addMetric } from "../controllers/metricController.js";
import { authenticateToken } from "../middlewares/middleware.js";

const router = express.Router();

// Seluruh endpoint konten dilindungi oleh authenticateToken
router.use(authenticateToken);

// CRUD Konten & Pipeline (Tiket CCP-03)
router.get("/", getContents);
router.post("/", createContent);
router.get("/:id", getContentById);
router.put("/:id", updateContent);
router.patch("/:id", updateContent);
router.delete("/:id", deleteContent);

// Submodul Checklists per Konten (Tiket CCP-04)
router.post("/:id/checklists", addChecklist);

// Submodul Metrics Snapshot per Konten (Tiket CCP-05)
router.post("/:id/metrics", addMetric);

export default router;

