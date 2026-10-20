import pool from "../config/db.js";
import sendResponse from "../utils/response.js";

// POST /api/v1/contents/:id/checklists (Menambah item checklist baru)
export const addChecklist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contentId = req.params.id;
    const { task_name } = req.body;

    if (!task_name || typeof task_name !== "string" || task_name.trim() === "") {
      return sendResponse(res, 400, false, "Task name is required");
    }

    // Pastikan konten ada dan milik user
    const [contents] = await pool.execute(
      "SELECT id FROM contents WHERE id = ? AND user_id = ?",
      [contentId, userId]
    );

    if (contents.length === 0) {
      return sendResponse(res, 404, false, "Content not found");
    }

    const [result] = await pool.execute(
      "INSERT INTO content_checklists (content_id, task_name, is_completed) VALUES (?, ?, false)",
      [contentId, task_name.trim()]
    );

    return sendResponse(res, 201, true, "Checklist item added successfully", {
      id: result.insertId,
      content_id: Number(contentId),
      task_name: task_name.trim(),
      is_completed: false,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/checklists/:id/toggle (Toggle status is_completed)
export const toggleChecklist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const checklistId = req.params.id;

    // Pastikan checklist ada dan terkait dengan konten milik user
    const [checklists] = await pool.execute(
      `
      SELECT cl.id, cl.content_id, cl.task_name, cl.is_completed
      FROM content_checklists cl
      JOIN contents c ON cl.content_id = c.id
      WHERE cl.id = ? AND c.user_id = ?
      `,
      [checklistId, userId]
    );

    if (checklists.length === 0) {
      return sendResponse(res, 404, false, "Checklist item not found");
    }

    const currentChecklist = checklists[0];
    const newStatus = !currentChecklist.is_completed;

    await pool.execute(
      "UPDATE content_checklists SET is_completed = ? WHERE id = ?",
      [newStatus, checklistId]
    );

    return sendResponse(res, 200, true, "Checklist status toggled successfully", {
      id: Number(checklistId),
      content_id: currentChecklist.content_id,
      task_name: currentChecklist.task_name,
      is_completed: newStatus,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/checklists/:id (Hapus item checklist)
export const deleteChecklist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const checklistId = req.params.id;

    // Pastikan checklist ada dan terkait dengan konten milik user
    const [checklists] = await pool.execute(
      `
      SELECT cl.id
      FROM content_checklists cl
      JOIN contents c ON cl.content_id = c.id
      WHERE cl.id = ? AND c.user_id = ?
      `,
      [checklistId, userId]
    );

    if (checklists.length === 0) {
      return sendResponse(res, 404, false, "Checklist item not found");
    }

    await pool.execute("DELETE FROM content_checklists WHERE id = ?", [checklistId]);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

