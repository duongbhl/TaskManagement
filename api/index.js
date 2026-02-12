import Fastify from 'fastify';
import cors from '@fastify/cors';
import envPlugin from '../backend/config/env.js';
import routes from '../backend/routes/index.js';
import { initFirebase } from '../backend/config/firebase.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
});

await app.register(envPlugin);

try {
  initFirebase();
  console.log('🔥 Database connected!');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  process.exit(1);
}

await app.register(routes);

export default async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
};
