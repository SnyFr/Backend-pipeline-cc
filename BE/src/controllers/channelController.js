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

    return sendResponse(res, 200, true, "Get channels success", channels);
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

    let cleanHandle = handle_name.trim();

    if (!cleanHandle.startsWith("@")) {
      cleanHandle = `@${cleanHandle}`;
    }

    if (/\s/.test(cleanHandle)) {
      return sendResponse(res, 400, false, "Handle name should not contain spaces");
    }

    const [existingChannels] = await pool.execute(
      "SELECT id FROM channels WHERE user_id = ? AND platform = ? AND handle_name = ? LIMIT 1",
      [userId, normalPlatform, cleanHandle]
    );

    if (existingChannels.length > 0) {
      return sendResponse(res, 409, false, "Channel with this platform and handle already exists");
    }

    const [result] = await pool.execute(
      "INSERT INTO channels (user_id, platform, handle_name) VALUES (?, ?, ?)",
      [userId, normalPlatform, cleanHandle]
    );

    return sendResponse(res, 201, true, "Channel created successfully", {
      id: result.insertId,
      user_id: userId,
      platform: normalPlatform,
      handle_name: cleanHandle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChannel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; 
    const { platform, handle_name } = req.body;

    const [existingChannels] = await pool.execute(
      "SELECT id FROM channels WHERE id = ? AND user_id = ? LIMIT 1",
      [id, userId]
    );

    if (existingChannels.length === 0) {
      return sendResponse(res, 404, false, "Channel not found or unauthorized");
    }

    let normalPlatform;
    if (platform) {
      if (typeof platform !== "string") {
        return sendResponse(res, 400, false, "Platform must be a string");
      }
      normalPlatform = platform.trim().toLowerCase();
      if (!VALID_PLATFORMS.includes(normalPlatform)) {
        return sendResponse(
          res,
          400,
          false,
          `Invalid platform. Allowed values: ${VALID_PLATFORMS.join(", ")}`
        );
      }
    }

    let cleanHandle;
    if (handle_name) {
      if (typeof handle_name !== "string" || handle_name.trim() === "") {
        return sendResponse(res, 400, false, "Handle name cannot be empty");
      }
      cleanHandle = handle_name.trim();
      if (!cleanHandle.startsWith("@")) {
        cleanHandle = `@${cleanHandle}`;
      }
      if (/\s/.test(cleanHandle)) {
        return sendResponse(res, 400, false, "Handle name should not contain spaces");
      }
    }

    if (!normalPlatform && !cleanHandle) {
      return sendResponse(res, 400, false, "At least one field (platform or handle_name) is required to update");
    }

    if (normalPlatform || cleanHandle) {
      const [duplicate] = await pool.execute(
        "SELECT id FROM channels WHERE user_id = ? AND platform = COALESCE(?, platform) AND handle_name = COALESCE(?, handle_name) AND id != ? LIMIT 1",
        [userId, normalPlatform || null, cleanHandle || null, id]
      );

      if (duplicate.length > 0) {
        return sendResponse(res, 409, false, "Channel with this platform and handle already exists");
      }
    }

    await pool.execute(
      "UPDATE channels SET platform = COALESCE(?, platform), handle_name = COALESCE(?, handle_name) WHERE id = ? AND user_id = ?",
      [normalPlatform || null, cleanHandle || null, id, userId]
    );

    return sendResponse(res, 200, true, "Channel updated successfully");
  } catch (error) {
    next(error);
  }
};