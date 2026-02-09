import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.register(import('@fastify/env'), {
    dotenv: true,
    schema: {
      type: 'object',
      required: ['FIREBASE_PROJECT_ID'],
      properties: {
        PORT: { type: 'string', default: '8080' },
        FIREBASE_PROJECT_ID: { type: 'string' }
      }
    }
  });
});
