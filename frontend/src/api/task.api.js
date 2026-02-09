import { http } from './http';

export const taskApi = {
  list: async () => {
    try {
      const response = await http.get('/tasks');
      console.log('✅ List tasks:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ List tasks failed:', error.response?.data || error.message);
      throw error;
    }
  },

  get: async (id) => {
    try {
      const response = await http.get(`/tasks/${id}`);
      console.log(`✅ Get task ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Get task ${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await http.post('/tasks', data);
      console.log('✅ Create task:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create task failed:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, patch) => {
    try {
      console.log(`📝 Updating task ${id} with:`, patch);
      const response = await http.patch(`/tasks/${id}`, patch);
      console.log(`✅ Update task ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Update task ${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      console.log(`🗑️ Deleting task ${id}`);
      const response = await http.delete(`/tasks/${id}`);
      console.log(`✅ Delete task ${id} successful`);
      return response.data || { success: true };
    } catch (error) {
      console.error(`❌ Delete task ${id} failed:`, error.response?.data || error.message);
      throw error;
    }
  }
};
