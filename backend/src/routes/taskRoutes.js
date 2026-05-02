import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, adminOnly, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

export default router;
