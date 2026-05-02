import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LayoutDashboard, CheckCircle, Clock, AlertTriangle, FolderKanban } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 text-${color}-500`} aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-10">
        <StatCard title="Total Projects" value={stats.totalProjects} icon={FolderKanban} color="indigo" />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={LayoutDashboard} color="blue" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} icon={CheckCircle} color="green" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={Clock} color="yellow" />
        <StatCard title="Overdue Tasks" value={stats.overdueTasks} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-10">
        {/* Chart Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Chart by Priority</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'High', total: stats.tasksByPriority?.find(p => p._id === 'High')?.total || 0 },
                  { name: 'Medium', total: stats.tasksByPriority?.find(p => p._id === 'Medium')?.total || 0 },
                  { name: 'Low', total: stats.tasksByPriority?.find(p => p._id === 'Low')?.total || 0 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-slate-400 mr-2 rounded-sm"></div>
              total
            </div>
          </div>
        </div>

        {/* You can add another widget here or leave it empty for now */}
        <div className="bg-white shadow rounded-lg p-6 border-dashed border-2 border-gray-200 flex items-center justify-center">
          <p className="text-gray-400">Additional Analytics Coming Soon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Overdue Tasks Section */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-red-500">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Critical Overdue Tasks
          </h2>
          <div className="space-y-4">
            {stats.recentOverdueTasks?.map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-red-50 rounded-md border border-red-100">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-red-800 truncate">{task.title}</p>
                  <p className="text-xs text-red-600 truncate">Project: {task.projectId?.name} | Assigned to: <span className="font-bold">{task.assignedTo?.name || 'Unassigned'}</span></p>
                </div>
                <div className="ml-4 text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">
                  Overdue
                </div>
              </div>
            ))}
            {(!stats.recentOverdueTasks || stats.recentOverdueTasks.length === 0) && (
              <p className="text-sm text-gray-500 py-4 text-center">No overdue tasks. Good job!</p>
            )}
          </div>
        </div>

        {/* Pending Tasks Section */}
        <div className="bg-white shadow rounded-lg p-6 border-t-4 border-yellow-500">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            Upcoming Pending Tasks
          </h2>
          <div className="space-y-4">
            {stats.recentPendingTasks?.map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-white transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 truncate">Project: {task.projectId?.name} | Assigned to: <span className="font-bold">{task.assignedTo?.name || 'Unassigned'}</span></p>
                </div>
                <div className="ml-4 text-xs text-gray-500 italic">
                  {task.status}
                </div>
              </div>
            ))}
            {(!stats.recentPendingTasks || stats.recentPendingTasks.length === 0) && (
              <p className="text-sm text-gray-500 py-4 text-center">No pending tasks found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
