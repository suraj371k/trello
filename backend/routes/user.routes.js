import { Router } from "express";
import {
  getProfile,
  login,
  logout,
  register,
  getAllUsers,
} from "../controllers/user.controller.js";
import protectedRoute from "../middleware/protected.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/get-profile", protectedRoute, getProfile);
router.get("/all", protectedRoute, getAllUsers);

export default router;