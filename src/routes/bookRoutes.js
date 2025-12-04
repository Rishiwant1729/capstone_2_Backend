import { Router } from "express";
import {
  uploadBook,
  getBooks,
  getBookSummary,
  deleteBook,
} from "../controllers/bookController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.use(requireAuth);

router.post("/upload", upload.single("pdf"), uploadBook);
router.get("/", getBooks);
router.get("/:id/summary", getBookSummary);
router.delete("/:id/delete", deleteBook);

export default router;

