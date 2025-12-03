import { Router } from "express";
import {
  getProfile,
  listUsers,
  login,
  signup,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getProfile);
router.get("/users", requireAuth, listUsers);

export default router;

