import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, deadline, priority } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      deadline,
      priority,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};

    if (projectId) {
      query.projectId = projectId;
    }

    // Admins see all tasks for the query. Members only see tasks assigned to them.
    if (req.user.role !== 'Admin') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email');
      
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, deadline, submission, priority } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status and submission of their assigned tasks
    if (req.user.role !== 'Admin') {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      // Members can update status and submission
      task.status = status || task.status;
      if (submission !== undefined) task.submission = submission;
    } else {
      // Admins can update everything
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status || task.status;
      task.assignedTo = assignedTo || task.assignedTo;
      task.deadline = deadline || task.deadline;
      task.priority = priority || task.priority;
      if (submission !== undefined) task.submission = submission;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
