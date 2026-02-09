import { create, get, getAll, remove, update } from "../controllers/item.controller.js";

export default async function taskRoutes(fastify) {
    fastify.get('/tasks', getAll);
    fastify.get('/tasks/:id', get);
    fastify.post('/tasks', create);
    fastify.patch('/tasks/:id', update);
    fastify.delete('/tasks/:id', remove);
    
    // Handle preflight requests for CORS
    fastify.options('/tasks', (request, reply) => {
        reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        reply.send(200);
    });
    
    fastify.options('/tasks/:id', (request, reply) => {
        reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        reply.send(200);
    });
}