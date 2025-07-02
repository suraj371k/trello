import { Router } from "express";
import {
  getProfile,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import protectedRoute from "../middleware/protected.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/get-profile", protectedRoute, getProfile);

export default router;