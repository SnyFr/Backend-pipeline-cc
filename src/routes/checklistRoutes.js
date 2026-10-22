import express from "express";
import {
  toggleChecklist,
  deleteChecklist,
} from "../controllers/checklistController.js";
import { authenticateToken } from "../middlewares/middleware.js";

const router = express.Router();

// Semua aksi checklist dilindungi authenticateToken
router.use(authenticateToken);

// PATCH /api/v1/checklists/:id/toggle (Tiket CCP-04)
router.patch("/:id/toggle", toggleChecklist);

// DELETE /api/v1/checklists/:id (Tiket CCP-04 Acceptance Criteria)
router.delete("/:id", deleteChecklist);

export default router;

