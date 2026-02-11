import {
  getAllUsersController,
  getAllTasksAdmin,
  getTasksByUserId,
  getUserDetailsAdmin
} from "../controllers/admin.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

export default async function adminRoutes(fastify) {
  // All admin routes require authentication and admin role
  const adminPreHandlers = [verifyToken, requireAdmin];

  // Get all users
  fastify.get('/admin/users', { preHandler: adminPreHandlers }, getAllUsersController);

  // Get all tasks
  fastify.get('/admin/tasks', { preHandler: adminPreHandlers }, getAllTasksAdmin);

  // Get tasks for specific user
  fastify.get('/admin/users/:userId/tasks', { preHandler: adminPreHandlers }, getTasksByUserId);

  // Get user details with their tasks
  fastify.get('/admin/users/:userId', { preHandler: adminPreHandlers }, getUserDetailsAdmin);
}
