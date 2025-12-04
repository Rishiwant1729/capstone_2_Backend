import { Router } from "express";
import {
  uploadBook,
  getBooks,
  getBookSummary,
  deleteBook,
  updateSummary,
  deleteSummary,
  regenerateSummary,
} from "../controllers/bookController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.use(requireAuth);

router.post("/upload", upload.single("pdf"), uploadBook);
router.get("/", getBooks);
router.get("/:id/summary", getBookSummary);
router.delete("/:id/delete", deleteBook);

// Summary operations
router.put("/:id/summary", updateSummary);              // Edit summary
router.delete("/:id/summary", deleteSummary);           // Delete summary
router.post("/:id/summary/regenerate", regenerateSummary); // Regenerate summary

export default router;

