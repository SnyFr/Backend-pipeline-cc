import express from "express";
import { getChannels, createChannel, updateChannel } from "../controllers/channelController.js";
import { authenticateToken } from "../middlewares/middleware.js";

const router = express.Router();


router.use(authenticateToken);

router.get("/", getChannels);
router.post("/", createChannel);
router.put("/:id". updateChannel);

export default router;

