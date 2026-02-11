import { http } from './http';

export const adminApi = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await http.get('/admin/users');
      console.log('✅ Get all users:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get all users failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all tasks
  getAllTasks: async () => {
    try {
      const response = await http.get('/admin/tasks');
      console.log('✅ Get all tasks:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get all tasks failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get tasks for specific user
  getTasksByUserId: async (userId) => {
    try {
      const response = await http.get(`/admin/users/${userId}/tasks`);
      console.log(`✅ Get tasks for user ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Get tasks for user ${userId} failed:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get user details with their tasks
  getUserDetails: async (userId) => {
    try {
      const response = await http.get(`/admin/users/${userId}`);
      console.log(`✅ Get user details for ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Get user details for ${userId} failed:`, error.response?.data || error.message);
      throw error;
    }
  }
};
