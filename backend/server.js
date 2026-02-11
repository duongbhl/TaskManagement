import Fastify from 'fastify';
import cors from '@fastify/cors';

import envPlugin from './config/env.js';
import routes from './routes/index.js';
import { initFirebase } from './config/firebase.js';


const app = Fastify({logger:true});

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

const port = Number(process.env.PORT || 8080);
app.listen({ port});
console.log(`🚀 Server running at http://0.0.0.0:${port}`);