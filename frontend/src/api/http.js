import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Set token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

