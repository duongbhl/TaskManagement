import { register, login, getCurrentUser, forgotPassword, resetPassword, changePassword } from '../controllers/auth.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

export default async function authRoutes(fastify) {
  // Public routes
  fastify.post('/auth/register', register);
  fastify.post('/auth/login', login);
  fastify.post('/auth/forgot-password', forgotPassword);
  fastify.post('/auth/reset-password', resetPassword);

  // Protected routes
  fastify.get('/auth/me', getCurrentUser);
  fastify.post('/auth/change-password', { onRequest: [verifyToken] }, changePassword);
}
