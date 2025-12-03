import { Router } from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
} from "../controllers/bookController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.use(requireAuth);

router.get("/", getBooks);
router.post("/", upload.single("pdf"), createBook);
router.get("/:bookId", getBookById);
router.delete("/:bookId", deleteBook);

export default router;

