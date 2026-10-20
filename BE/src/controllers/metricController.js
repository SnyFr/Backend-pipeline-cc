import pool from "../config/db.js";
import sendResponse from "../utils/response.js";

// POST /api/v1/contents/:id/metrics (Mencatat log snapshot performa konten)
export const addMetric = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.id;
    const {
      recorded_at,
      views_count = 0,
      likes_count = 0,
      comments_count = 0,
      shares_count = 0,
    } = req.body;

    // Pastikan konten ada dan milik user
    const [contents] = await pool.execute(
      "SELECT id FROM contents WHERE id = ? AND user_id = ?",
      [contentId, userId]
    );

    if (contents.length === 0) {
      return sendResponse(res, 404, false, "Content not found");
    }

    // Validasi angka tidak boleh negatif
    const views = Number(views_count);
    const likes = Number(likes_count);
    const comments = Number(comments_count);
    const shares = Number(shares_count);

    if (
      isNaN(views) || views < 0 ||
      isNaN(likes) || likes < 0 ||
      isNaN(comments) || comments < 0 ||
      isNaN(shares) || shares < 0
    ) {
      return sendResponse(
        res,
        400,
        false,
        "Metric counts (views, likes, comments, shares) must be non-negative"
      );
    }

    const metricDate = recorded_at || new Date().toISOString().split("T")[0];

    const [result] = await pool.execute(
      `
      INSERT INTO content_metrics 
      (content_id, recorded_at, views_count, likes_count, comments_count, shares_count)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [contentId, metricDate, views, likes, comments, shares]
    );

    return sendResponse(res, 201, true, "Metric recorded successfully", {
      id: result.insertId,
      content_id: Number(contentId),
      recorded_at: metricDate,
      views_count: views,
      likes_count: likes,
      comments_count: comments,
      shares_count: shares,
    });
  } catch (error) {
    next(error);
  }
};

