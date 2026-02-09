import taskRoutes from "./item.route.js"

export default async function routes(fastify){
    fastify.register(taskRoutes, {prefix:'/api'});
}