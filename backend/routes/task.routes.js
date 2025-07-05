import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  forceUpdateTask,
  moveTask,
  assignTask,
  smartAssign
} from "../controllers/task.controller.js";
import { getActionLogs, getActionLogsByTask } from "../controllers/actionLog.controller.js";
import protectedRoute from "../middleware/protected.js";

const router = express.Router();

// Task CRUD routes
router.post("/create", protectedRoute, createTask);
router.get("/", protectedRoute, getTasks);
router.put("/:id", protectedRoute, updateTask);
router.put("/:id/force", protectedRoute, forceUpdateTask);
router.delete("/:id", protectedRoute, deleteTask);

// Task management routes
router.patch("/:id/move", protectedRoute, moveTask);
router.patch("/:id/assign", protectedRoute, assignTask);
router.patch("/:id/smart-assign", protectedRoute, smartAssign);

// Action log routes
router.get("/logs", protectedRoute, getActionLogs);
router.get("/:taskId/logs", protectedRoute, getActionLogsByTask);

export default router;
