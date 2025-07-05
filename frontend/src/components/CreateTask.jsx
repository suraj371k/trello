import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Flag,
  User,
  Plus,
  AlertCircle,
  Zap,
} from "lucide-react";
import useTaskStore from "../store/taskStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

const CreateTask = ({ isOpen, onClose }) => {
  const { createTask, loading } = useTaskStore();
  const { getAllUsers } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (isOpen) {
      getAllUsers().then(setUsers);
    }
  }, [isOpen, getAllUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSmartAssign = () => {
    if (users.length === 0) {
      toast.error("No users available for smart assignment");
      return;
    }

    // Get all current tasks to calculate workload
    const currentTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // Calculate task count for each user (only active tasks - Todo and In Progress)
    const userTaskCounts = {};
    users.forEach(user => {
      userTaskCounts[user._id] = 0;
    });

    currentTasks.forEach(task => {
      if (task.assignedTo && (task.status === 'Todo' || task.status === 'In Progress')) {
        userTaskCounts[task.assignedTo] = (userTaskCounts[task.assignedTo] || 0) + 1;
      }
    });

    // Find user with minimum tasks
    let minTasks = Infinity;
    let selectedUser = null;

    users.forEach(user => {
      const taskCount = userTaskCounts[user._id] || 0;
      if (taskCount < minTasks) {
        minTasks = taskCount;
        selectedUser = user;
      }
    });

    if (selectedUser) {
      setForm(prev => ({
        ...prev,
        assignedTo: selectedUser._id
      }));
      toast.success(`Smart assigned to ${selectedUser.username} (${minTasks} active tasks)`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const taskData = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };

      await createTask(taskData);
      toast.success("Task created successfully!");
      handleClose();
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleClose = () => {
    setForm({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      assignedTo: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <Flag className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={handleSmartAssign}
                className="px-3 py-2 hover:bg-yellow-100 rounded-lg transition-colors border border-gray-300 flex items-center gap-1"
                title="Smart Assign"
              >
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">Smart</span>
              </button>
            </div>
          </div>

          {/* Priority Color Indicator */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Flag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Priority:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                form.priority === "Low"
                  ? "bg-blue-100 text-blue-800"
                  : form.priority === "Medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : form.priority === "High"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {form.priority}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
