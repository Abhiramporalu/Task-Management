import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getDashboardStats = async (req, res) => {
  try {
    let taskQuery = {};
    let projectQuery = {};

    if (req.user.role !== 'Admin') {
      taskQuery.assignedTo = req.user._id;
      projectQuery.members = req.user._id;
    }

    const now = new Date();
    const stats = await Task.aggregate([
      { $match: taskQuery },
      {
        $facet: {
          totalTasks: [{ $count: 'count' }],
          completedTasks: [
            { $match: { status: 'Done' } },
            { $count: 'count' }
          ],
          pendingTasks: [
            { $match: { status: { $ne: 'Done' } } },
            { $count: 'count' }
          ],
          overdueTasks: [
            { $match: { status: { $ne: 'Done' }, deadline: { $lt: now } } },
            { $count: 'count' }
          ],
          tasksByPriority: [
            {
              $group: {
                _id: '$priority',
                total: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const totalTasks = stats[0].totalTasks[0]?.count || 0;
    const completedTasks = stats[0].completedTasks[0]?.count || 0;
    const pendingTasks = stats[0].pendingTasks[0]?.count || 0;
    const overdueTasks = stats[0].overdueTasks[0]?.count || 0;
    const tasksByPriority = stats[0].tasksByPriority;

    const totalProjects = await Project.countDocuments(projectQuery);

    // Fetch details for the lists
    const recentPendingTasks = await Task.find({ ...taskQuery, status: { $ne: 'Done' } })
      .populate('projectId', 'name')
      .populate('assignedTo', 'name')
      .sort({ deadline: 1 })
      .limit(5);

    const recentOverdueTasks = await Task.find({
      ...taskQuery,
      status: { $ne: 'Done' },
      deadline: { $lt: now }
    })
      .populate('projectId', 'name')
      .populate('assignedTo', 'name')
      .sort({ deadline: 1 })
      .limit(5);

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalProjects,
      recentPendingTasks,
      recentOverdueTasks,
      tasksByPriority,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
