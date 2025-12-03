import { Router } from "express";
import {
  getSummaries,
  getSummaryById,
  regenerateSummary,
} from "../controllers/summaryController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getSummaries);
router.get("/:summaryId", getSummaryById);
router.post("/book/:bookId/regenerate", regenerateSummary);

export default router;

