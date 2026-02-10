import { http } from './http';

export const authApi = {
  register: async (data) => {
    try {
      const response = await http.post('/auth/register', data);
      console.log('✅ Register successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register failed:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (data) => {
    try {
      const response = await http.post('/auth/login', data);
      console.log('✅ Login successful:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Set token to default header for all future requests
        http.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete http.defaults.headers.common['Authorization'];
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
