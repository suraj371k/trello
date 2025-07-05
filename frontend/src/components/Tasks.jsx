import React, { useEffect, useState } from "react";
import {
  User,
  Calendar,
  Flag,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Zap,
} from "lucide-react";
import useTaskStore from "../store/taskStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import CreateTask from "./CreateTask";
import ConflictModal from "./ConflictModal";

const columns = [
  {
    id: "Todo",
    title: "Todo",
    color: "bg-red-50 border-red-200",
    accent: "bg-red-500",
    count: 0,
  },
  {
    id: "In Progress",
    title: "In Progress",
    color: "bg-yellow-50 border-yellow-200",
    accent: "bg-yellow-500",
    count: 0,
  },
  {
    id: "Done",
    title: "Done",
    color: "bg-green-50 border-green-200",
    accent: "bg-green-500",
    count: 0,
  },
];

const priorityColors = {
  Low: "bg-blue-100 text-blue-800 border-blue-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  High: "bg-orange-100 text-orange-800 border-orange-200",
  Critical: "bg-red-100 text-red-800 border-red-200",
};

const Tasks = () => {
  const {
    tasks,
    fetchTasks,
    moveTask,
    assignTask,
    updateTask,
    deleteTask,
    smartAssignTask,
    loading,
    initializeSocket,
    socketConnected,
  } = useTaskStore();
  const { getAllUsers } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictTask, setConflictTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    getAllUsers().then(setUsers);
    initializeSocket();
  }, []);

  // Filter tasks based on search and priority
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Group tasks by status with counts
  const grouped = columns.reduce((acc, col) => {
    acc[col.id] = filteredTasks.filter((t) => t.status === col.id);
    col.count = acc[col.id].length;
    return acc;
  }, {});

  const onDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const onDrop = async (colId) => {
    const task = tasks.find((t) => t._id === draggedTaskId);
    if (task && task.status !== colId) {
      try {
        const result = await moveTask(task._id, {
          status: colId,
          version: task.version,
        });
        if (result && result.conflict) {
          // Handle conflict for move operation
          toast.error(
            "Task was modified by another user. Please refresh and try again."
          );
        }
      } catch (error) {
        toast.error("Failed to move task");
      }
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDragEnter = (colId) => {
    setDragOverColumn(colId);
  };

  const onDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleAssign = async (taskId, userId) => {
    try {
      await assignTask(taskId, userId);
      const user = users.find((u) => u._id === userId);
      toast.success(`Task assigned to ${user ? user.username : "user"}`);
    } catch (error) {
      toast.error("Failed to assign task");
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const result = await smartAssignTask(taskId);
      if (result && result.assignedTo) {
        toast.success(
          `Task smart assigned to ${result.assignedTo} (${result.taskCount} active tasks)`
        );
      } else {
        toast.success("Task smart assigned successfully");
      }
    } catch (error) {
      toast.error("Failed to smart assign task");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleSave = async (taskId) => {
    try {
      const result = await updateTask(taskId, {
        ...editForm,
        version: tasks.find((t) => t._id === taskId)?.version,
      });

      // Check if there's a conflict
      if (result && result.conflict) {
        setConflictTask({ _id: taskId, ...editForm });
        setIsConflictModalOpen(true);
        return;
      }

      setEditingTask(null);
      setEditForm({});
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    setEditForm({});
  };

  const handleDelete = async (taskId, taskTitle) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      try {
        await deleteTask(taskId);
        toast.success("Task deleted successfully");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseConflictModal = () => {
    setIsConflictModalOpen(false);
    setConflictTask(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Connection Status */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-2 h-2 rounded-full ${
              socketConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-gray-600">
            {socketConnected ? "Real-time updates active" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading tasks...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div
              key={col.id}
              onDrop={() => onDrop(col.id)}
              onDragOver={onDragOver}
              onDragEnter={() => onDragEnter(col.id)}
              onDragLeave={onDragLeave}
              className={`${
                col.color
              } rounded-xl border-2 transition-all duration-200 ${
                dragOverColumn === col.id
                  ? "border-blue-400 shadow-lg scale-105"
                  : ""
              }`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${col.accent}`}></div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {col.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                      {col.count}
                    </span>
                    <button
                      onClick={handleCreateTask}
                      className="p-1 hover:bg-white/50 rounded-full transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks Container */}
              <div className="p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                {(grouped[col.id] || []).map((task) => (
                  <div
                    key={task._id}
                    draggable={editingTask !== task._id}
                    onDragStart={() => onDragStart(task._id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    className={`group bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
                      draggedTaskId === task._id
                        ? "opacity-50 rotate-2 scale-105"
                        : ""
                    } ${
                      editingTask === task._id
                        ? "cursor-default"
                        : "cursor-move"
                    }`}
                  >
                    {editingTask === task._id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                title: e.target.value,
                              })
                            }
                            className="font-semibold text-gray-900 text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full"
                            placeholder="Task title"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSave(task._id)}
                              className="p-1 hover:bg-green-100 rounded transition-colors"
                              title="Save"
                            >
                              <Save className="w-3 h-3 text-green-600" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className="text-gray-600 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full resize-none"
                          placeholder="Description"
                          rows="2"
                        />

                        <div className="flex gap-2">
                          <select
                            value={editForm.priority}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                priority: e.target.value,
                              })
                            }
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>

                          <input
                            type="date"
                            value={editForm.dueDate}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                dueDate: e.target.value,
                              })
                            }
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50"
                          />
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h3>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => handleEdit(task)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(task._id, task.title)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Priority Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              priorityColors[task.priority] ||
                              priorityColors.Low
                            }`}
                          >
                            <Flag className="w-3 h-3 mr-1" />
                            {task.priority}
                          </span>
                        </div>

                        {/* Assignment */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Assigned to
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              value={task.assignedTo?._id || ""}
                              onChange={(e) =>
                                handleAssign(task._id, e.target.value)
                              }
                            >
                              <option value="">Unassigned</option>
                              {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.username}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleSmartAssign(task._id)}
                              className="p-1.5 hover:bg-yellow-100 rounded-lg transition-colors border border-gray-200"
                              title="Smart Assign"
                            >
                              <Zap className="w-3 h-3 text-yellow-600" />
                            </button>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>

                          {task.lastEditedBy && (
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                  {getInitials(task.lastEditedBy.username)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {task.lastEditedBy.username}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Empty State */}
                {!loading && (grouped[col.id] || []).length === 0 && (
                  <div className="text-center py-8">
                    <button
                      onClick={handleCreateTask}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors cursor-pointer"
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                    </button>
                    <p className="text-gray-500 text-sm">No tasks yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Drag tasks here or create new ones
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTask isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} />

      {/* Conflict Modal */}
      <ConflictModal
        isOpen={isConflictModalOpen}
        onClose={handleCloseConflictModal}
        conflictData={useTaskStore.getState().conflictData}
        clientData={conflictTask}
        onResolve={(resolvedTask) => {
          // Update the task in local state
          const updatedTasks = tasks.map((task) =>
            task._id === resolvedTask._id ? resolvedTask : task
          );
          useTaskStore.getState().setTasks(updatedTasks);
          setEditingTask(null);
          setEditForm({});
          setIsConflictModalOpen(false);
          setConflictTask(null);
        }}
      />
    </div>
  );
};

export default Tasks;
