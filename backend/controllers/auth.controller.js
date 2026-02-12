import jwt from 'jsonwebtoken';
import { UserRegisterSchema, UserLoginSchema, ForgotPasswordSchema, ResetPasswordSchema, ChangePasswordSchema } from '../models/user.model.js';
import { createUser, getUserByEmail, verifyPassword, generatePasswordResetToken, resetPasswordWithToken, changePassword as changeUserPassword } from '../services/auth.service.js';
import { sendEmail } from '../utils/sendEmails.js';

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

// FORGOT PASSWORD - Generate reset token and send email
export async function forgotPassword(req, reply) {
  try {
    const validated = ForgotPasswordSchema.parse(req.body);
    const { email } = validated;

    const result = await generatePasswordResetToken(email);

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?email=${email}&token=${result.resetToken}`;

    // Send email with reset link
    await sendEmail(
      email,
      'Password Reset Request',
      `Click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.`
    );

    return reply.send({
      message: 'Password reset link has been sent to your email'
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return reply.code(400).send({
        message: 'Validation failed',
        errors: error.errors
      });
    }

    if (error.message === 'User not found') {
      return reply.code(404).send({
        message: 'User with this email does not exist'
      });
    }

    return reply.code(500).send({
      message: error.message
    });
  }
}

// RESET PASSWORD - Verify token and reset password
export async function resetPassword(req, reply) {
  try {
    const validated = ResetPasswordSchema.parse(req.body);
    const { email } = req.query;
    const { token, newPassword } = validated;

    if (!email) {
      return reply.code(400).send({
        message: 'Email is required'
      });
    }

    const result = await resetPasswordWithToken(email, token, newPassword);

    return reply.send({
      message: 'Password reset successfully',
      user: {
        id: result.id,
        email: result.email
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return reply.code(400).send({
        message: 'Validation failed',
        errors: error.errors
      });
    }

    if (error.message.includes('expired') || error.message.includes('Invalid') || error.message.includes('No reset token')) {
      return reply.code(400).send({
        message: error.message
      });
    }

    return reply.code(500).send({
      message: error.message
    });
  }
}

// CHANGE PASSWORD - For logged-in users
export async function changePassword(req, reply) {
  try {
    const validated = ChangePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = validated;
    const userId = req.user.id;

    const result = await changeUserPassword(userId, currentPassword, newPassword);

    return reply.send({
      message: 'Password changed successfully',
      user: {
        id: result.id,
        email: result.email
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return reply.code(400).send({
        message: 'Validation failed',
        errors: error.errors
      });
    }

    if (error.message === 'Current password is incorrect') {
      return reply.code(401).send({
        message: error.message
      });
    }

    return reply.code(500).send({
      message: error.message
    });
  }
}
