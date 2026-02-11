import { register, login, getCurrentUser } from '../controllers/auth.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

export default async function authRoutes(fastify) {
  // Public routes
  fastify.post('/auth/register', register);
  fastify.post('/auth/login', login);

  // Protected routes
  fastify.get('/auth/me', getCurrentUser);

  // CORS preflight
  // fastify.options('/auth/register', (request, reply) => {
  //   reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  //   reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  //   reply.send(200);
  // });

  // fastify.options('/auth/login', (request, reply) => {
  //   reply.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  //   reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  //   reply.send(200);
  // });

  // fastify.options('/auth/me', (request, reply) => {
  //   reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  //   reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  //   reply.send(200);
  // });
}
