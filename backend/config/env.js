import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.register(import('@fastify/env'), {
    dotenv: true,
    schema: {
      type: 'object',
      required: ['FIREBASE_PROJECT_ID', 'JWT_SECRET'],
      properties: {
        PORT: { type: 'string', default: '8080' },
        FIREBASE_PROJECT_ID: { type: 'string' },
        JWT_SECRET: { type: 'string' }
      }
    }
  });
});
