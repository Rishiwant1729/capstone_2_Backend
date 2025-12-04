import { Router } from "express";
import {
  addNote,
  getNotes,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Note routes
router.post("/summaries/:summaryId/notes", addNote);           // Add note to summary
router.get("/summaries/:summaryId/notes", getNotes);            // Get all notes for summary
router.put("/notes/:noteId", updateNote);                       // Update a note
router.delete("/notes/:noteId", deleteNote);                    // Delete a note

export default router;
