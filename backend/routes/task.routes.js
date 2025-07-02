import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import protectedRoute from "../middleware/protected.js";

const router = express.Router();

router.post("/create", protectedRoute, createTask);
router.get("/", protectedRoute, getTasks);
router.put("/:id", protectedRoute, updateTask);
router.delete("/:id", protectedRoute, deleteTask);

export default router;
