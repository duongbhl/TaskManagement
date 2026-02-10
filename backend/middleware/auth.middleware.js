import jwt from 'jsonwebtoken';
import { getUserById } from '../services/auth.service.js';

export async function verifyToken(request, reply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.code(401).send({
        message: 'Authorization header is missing'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return reply.code(401).send({
          message: 'Token has expired'
        });
      }
      return reply.code(401).send({
        message: 'Invalid token'
      });
    }

    // Get full user data from database
    const user = await getUserById(decoded.userId);
    if (!user) {
      return reply.code(401).send({
        message: 'User not found'
      });
    }

    // Attach user to request
    request.user = {
      id: user.id,
      ...user
    };

  } catch (error) {
    return reply.code(500).send({
      message: 'Authentication error',
      error: error.message
    });
  }
}

export function authGuard(request, reply, done) {
  verifyToken(request, reply);
  done();
}
