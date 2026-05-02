import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
  const [newMember, setNewMember] = useState('');

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);

      if (user?.role === 'Admin') {
        const usersRes = await api.get('/projects/users');
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' });
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const updatedMembers = [...project.members.map(m => m._id), newMember];
      await api.put(`/projects/${id}`, { members: updatedMembers });
      setShowMemberModal(false);
      setNewMember('');
      fetchData();
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus, submission = null) => {
    try {
      const updateData = { status: newStatus };
      if (submission !== null) updateData.submission = submission;
      await api.put(`/tasks/${taskId}`, updateData);
      fetchData();
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionTask, setSubmissionTask] = useState(null);
  const [submissionValue, setSubmissionValue] = useState('');

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    handleStatusChange(submissionTask._id, 'Done', submissionValue);
    setShowSubmitModal(false);
    setSubmissionValue('');
  };

  if (loading) return <div className="p-8">Loading project details...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 text-gray-600">{project.description}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">Members:</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {project.members.map(member => (
              <span key={member._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {member.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
        {isAdmin && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Task
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <li key={task._id} className="p-4 sm:px-6 hover:bg-gray-50">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-indigo-600 truncate">{task.title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                      <span>Assigned to: {task.assignedTo?.name}</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
                      {task.deadline && (
                        <span>Deadline: {format(new Date(task.deadline), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                    {isAdmin && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this task?')) {
                            try {
                              await api.delete(`/tasks/${task._id}`);
                              fetchData();
                            } catch (error) {
                              console.error('Failed to delete task', error);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      disabled={!isAdmin && task.assignedTo?._id !== user?._id}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    {!isAdmin && task.assignedTo?._id === user?._id && task.status !== 'Done' && (
                      <button
                        onClick={() => {
                          setSubmissionTask(task);
                          setShowSubmitModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                      >
                        Submit Answer
                      </button>
                    )}
                  </div>
                </div>
                {task.submission && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Answer Submission:</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.submission}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="p-4 text-center text-gray-500">No tasks found.</li>
          )}
        </ul>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowSubmitModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Submit Answer for "{submissionTask?.title}"</h3>
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer / Notes</label>
                  <textarea
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows="5"
                    placeholder="Enter your answer or submission details here..."
                    value={submissionValue}
                    onChange={(e) => setSubmissionValue(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => setShowSubmitModal(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Submit & Mark as Done</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modals... */}
      {showTaskModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTaskModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Task Title"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <select
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                >
                  <option value="" disabled>Assign to...</option>
                  {project.members.map(member => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                </select>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 border rounded-md text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowMemberModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Member to Project</h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <select
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                >
                  <option value="" disabled>Select User...</option>
                  {users.filter(u => !project.members.find(m => m._id === u._id)).map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 border rounded-md text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
