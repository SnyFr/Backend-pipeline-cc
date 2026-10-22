import pool from "../config/db.js";
import sendResponse from "../utils/response.js";

const VALID_PLATFORMS = ["youtube", "tiktok", "instagram", "linkedin"];

export const getChannels = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [channels] = await pool.execute(
      "SELECT id, user_id, platform, handle_name, created_at FROM channels WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return sendResponse(res, 200, true, "Get Channels Success!!", channels);
  } catch (error) {
    next(error);
  }
};

export const createChannel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { platform, handle_name } = req.body;

    if (!platform || typeof platform !== "string") {
      return sendResponse(res, 400, false, "Platform is required");
    }

    const normalPlatform = platform.trim().toLowerCase();
    if (!VALID_PLATFORMS.includes(normalPlatform)) {
      return sendResponse(
        res,
        400,
        false,
        `Invalid platform. Allowed values: ${VALID_PLATFORMS.join(", ")}`
      );
    }

    if (!handle_name || typeof handle_name !== "string" || handle_name.trim() === "") {
      return sendResponse(res, 400, false, "Handle name is required");
    }

    const nameHandle = handle_name.trim();

    const [result] = await pool.execute(
      "INSERT INTO channels (user_id, platform, handle_name) VALUES (?, ?, ?)",
      [userId, normalPlatform, nameHandle]
    );

    return sendResponse(res, 201, true, "Channel created successfully!", {
      id: result.insertId,
      user_id: userId,
      platform: normalPlatform,
      handle_name: nameHandle,
    });
  } catch (error) {
    next(error);
  }
};

