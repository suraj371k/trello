import { create } from 'zustand'
import axios from 'axios'

axios.defaults.withCredentials = true;


const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  // Register user
  register: async ({ username, email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/users/register', { username, email, password });
      set({ user: res.data.user || null, loading: false, error: null });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Registration failed',
        loading: false,
      });
      return null;
    }
  },

  // Login user
  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post('/api/users/login', { email, password });
      set({ user: res.data.user || null, loading: false, error: null });
      return res.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Login failed',
        loading: false,
      });
      return null;
    }
  },

  // Logout user
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post('/api/users/logout');
      set({ user: null, loading: false, error: null });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Logout failed',
        loading: false,
      });
    }
  },

  // Get current user's profile
  getProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/api/users/get-profile');
      set({ user: res.data.user || null, loading: false, error: null });
      return res.data.user;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch profile',
        loading: false,
      });
      return null;
    }
  },

  // Get all users
  getAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get('/api/users/all');
      set({ loading: false, error: null });
      return res.data.users || [];
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch users',
        loading: false,
      });
      return [];
    }
  },

  // Optionally, a method to set user directly (e.g., after refresh)
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
