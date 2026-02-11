import { create, get, getAll, remove, update } from "../controllers/item.controller.js";
import { verifyToken, checkTaskOwnership } from "../middleware/auth.middleware.js";

export default async function taskRoutes(fastify) {
    // Get all tasks (with filtering based on user role)
    fastify.get('/tasks', { preHandler: verifyToken }, getAll);
    
    // Get single task (with ownership check)
    fastify.get('/tasks/:id', { preHandler: [verifyToken, checkTaskOwnership] }, get);
    
    // Create task (requires authentication)
    fastify.post('/tasks', { preHandler: verifyToken }, create);
    
    // Update task (with ownership check)
    fastify.patch('/tasks/:id', { preHandler: [verifyToken, checkTaskOwnership] }, update);
    
    // Delete task (with ownership check)
    fastify.delete('/tasks/:id', { preHandler: [verifyToken, checkTaskOwnership] }, remove);
}