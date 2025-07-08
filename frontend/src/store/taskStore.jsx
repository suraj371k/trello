import { create } from 'zustand'
import axios from 'axios'
import { io } from 'socket.io-client'

// Use the same backend URL as in authStore
const backend_url = 'https://trello-backend-wll8.onrender.com';

// Socket.IO connection
let socket = null;

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  socketConnected: false,
  conflictData: null, // Store conflict information

  // Initialize Socket.IO connection
  initializeSocket: () => {
    if (socket) return; // Already connected

    // Connect to Socket.IO server
    socket = io(backend_url, {
      withCredentials: true,
    });

    // Socket connection events
    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      set({ socketConnected: true });
      socket.emit('join-board');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      set({ socketConnected: false });
    });

    // Real-time task events
    socket.on('task-created', (data) => {
      set((state) => ({
        tasks: [data.task, ...state.tasks],
      }));
    });

    socket.on('task-updated', (data) => {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === data.task._id ? data.task : task
        ),
      }));
    });

    socket.on('task-deleted', (data) => {
      set((state) => ({
        tasks: state.tasks.filter((task) => task._id !== data.taskId),
      }));
    });

    socket.on('task-moved', (data) => {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === data.task._id ? data.task : task
        ),
      }));
    });
  },

  // Disconnect Socket.IO
  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      set({ socketConnected: false });
    }
  },

  // Clear conflict data
  clearConflict: () => set({ conflictData: null }),

  // Fetch all tasks
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${backend_url}/api/tasks/`);
      set({ tasks: res.data.tasks || [], loading: false, error: null });
      return res.data.tasks;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch tasks',
        loading: false,
      });
      return [];
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${backend_url}/api/tasks/create`, taskData);
      set({ loading: false, error: null });
      return res.data.task;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to create task',
        loading: false,
      });
      return null;
    }
  },

  // Update a task
  updateTask: async (id, updateData) => {
    set({ loading: true, error: null, conflictData: null });
    try {
      const res = await axios.put(`${backend_url}/api/tasks/${id}`, updateData);
      set({ loading: false, error: null });
      return res.data.task;
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        set({
          conflictData: err.response.data,
          loading: false,
          error: null
        });
        return { conflict: true, data: err.response.data };
      }
      set({
        error: err.response?.data?.message || 'Failed to update task',
        loading: false,
      });
      return null;
    }
  },

  // Force update a task (overwrite conflicting changes)
  forceUpdateTask: async (id, updateData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`${backend_url}/api/tasks/${id}/force`, updateData);
      set({ loading: false, error: null, conflictData: null });
      return res.data.task;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to force update task',
        loading: false,
      });
      return null;
    }
  },

  // Delete a task
  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${backend_url}/api/tasks/${id}`);
      set({ loading: false, error: null });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to delete task',
        loading: false,
      });
      return false;
    }
  },

  // Move a task (change status)
  moveTask: async (id, { status, version }) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`${backend_url}/api/tasks/${id}/move`, { status, version });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === id ? { ...task, status } : task
        ),
        loading: false,
        error: null,
      }));
      return res.data.task;
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        set({
          conflictData: err.response.data,
          loading: false,
          error: null
        });
        return { conflict: true, data: err.response.data };
      }
      set({
        error: err.response?.data?.message || 'Failed to move task',
        loading: false,
      });
      return null;
    }
  },

  // Assign a task to a user
  assignTask: async (id, assignedTo) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`${backend_url}/api/tasks/${id}/assign`, { assignedTo });
      set({ loading: false, error: null });
      return res.data.task;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to assign task',
        loading: false,
      });
      return null;
    }
  },

  // Smart assign a task
  smartAssignTask: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`${backend_url}/api/tasks/${id}/smart-assign`);
      set({ loading: false, error: null });
      return res.data.task;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to smart assign task',
        loading: false,
      });
      return null;
    }
  },

  // Optionally, set tasks directly (for socket updates, etc.)
  setTasks: (tasks) => set({ tasks }),
}));

export default useTaskStore;