import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getUsers,
} from '../controllers/projectController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, adminOnly, createProject);

router.get('/users', protect, adminOnly, getUsers);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

export default router;
