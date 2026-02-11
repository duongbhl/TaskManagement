import { z } from 'zod';

export const UserRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  role:z.enum(['admin','user']).default('user'),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
});
