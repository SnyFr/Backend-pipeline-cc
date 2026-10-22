import express from "express";
import { getChannels, createChannel } from "../controllers/channelController.js";
import { authenticateToken } from "../middlewares/middleware.js";

const router = express.Router();

// Semua endpoint channel memerlukan token otentikasi
router.use(authenticateToken);

router.get("/", getChannels);
router.post("/", createChannel);

export default router;

