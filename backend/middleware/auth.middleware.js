import jwt from 'jsonwebtoken';
import { getUserById } from '../services/auth.service.js';
import { getTask } from '../services/item.service.js';

// ============= AUTHENTICATION MIDDLEWARE =============

/**
 * Verify JWT token and attach user to request
 */
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
    request.user = user;

  } catch (error) {
    return reply.code(500).send({
      message: 'Authentication error',
      error: error.message
    });
  }
}

// ============= AUTHORIZATION MIDDLEWARE =============

/**
 * Check if user has admin role
 */
export async function requireAdmin(request, reply) {
  if (!request.user) {
    return reply.code(401).send({
      message: 'Unauthorized'
    });
  }

  if (request.user.role !== 'admin') {
    return reply.code(403).send({
      message: 'Only admins can access this resource'
    });
  }
}

/**
 * Check if user has specific role
 */
export function requireRole(role) {
  return async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        message: 'User not authenticated'
      });
    }
    if (request.user.role !== role) {
      return reply.code(403).send({
        message: `Only ${role}s can access this resource`
      });
    }
  };
}

/**
 * Check task ownership - Admin can access any task, users can only access their own
 */
export async function checkTaskOwnership(request, reply) {
  try {
    if (!request.user) {
      return reply.code(401).send({
        message: 'Unauthorized'
      });
    }

    const { id } = request.params;
    const task = await getTask(id);

    if (!task) {
      return reply.code(404).send({
        message: 'Task not found'
      });
    }

    // Admin can access any task, but regular users can only access their own
    if (request.user.role !== 'admin' && task.ownerId !== request.user.id) {
      return reply.code(403).send({
        message: 'You do not have permission to access this task'
      });
    }

    // Store task in request for later use if needed
    request.task = task;
  } catch (error) {
    return reply.code(500).send({
      message: 'Authorization error',
      error: error.message
    });
  }
}

// ============= HELPER FUNCTIONS =============

/**
 * Legacy auth guard helper - for backward compatibility
 */
export async function authGuard(request, reply) {
  return verifyToken(request, reply);
}
