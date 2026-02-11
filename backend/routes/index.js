import taskRoutes from "./item.route.js"
import authRoutes from "./auth.route.js"
import adminRoutes from "./admin.route.js"

export default async function routes(fastify){
    fastify.register(authRoutes, {prefix:'/api'});
    fastify.register(taskRoutes, {prefix:'/api'});
    fastify.register(adminRoutes, {prefix:'/api'});
}