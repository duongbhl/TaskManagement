import jwt from 'jsonwebtoken';
import { UserRegisterSchema, UserLoginSchema } from '../models/user.model.js';
import { createUser, getUserByEmail, verifyPassword } from '../services/auth.service.js';

// REGISTER
export async function register(req, reply) {
  try {
    const validated = UserRegisterSchema.parse(req.body);
    
    const newUser = await createUser(validated);
    
    return reply.code(201).send({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return reply.code(400).send({
        message: 'Validation failed',
        errors: error.errors
      });
    }
    
    return reply.code(400).send({
      message: error.message
    });
  }
}

// LOGIN
export async function login(req, reply) {
  try {
    const validated = UserLoginSchema.parse(req.body);
    const { email, password } = validated;

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return reply.code(401).send({
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return reply.code(401).send({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return reply.send({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return reply.code(400).send({
        message: 'Validation failed',
        errors: error.errors
      });
    }

    return reply.code(400).send({
      message: error.message
    });
  }
}

// GET CURRENT USER (from token)
export async function getCurrentUser(req, reply) {
  try {
    const user = req.user;
    return reply.send({
      user
    });
  } catch (error) {
    return reply.code(500).send({
      message: error.message
    });
  }
}
