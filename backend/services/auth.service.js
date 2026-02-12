import { db } from '../config/firebase.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const usersCollection = () => db().collection('users');

// CREATE USER
export async function createUser(userData) {
  try {
    const { email, name, password} = userData;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRef = usersCollection().doc();
    const user = {
      email,
      name,
      password: hashedPassword,
      role: "user",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await userRef.set(user);
    
    // Return user without password
    return {
      id: userRef.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// GET USER BY EMAIL
export async function getUserByEmail(email) {
  try {
    const snapshot = await usersCollection()
      .where('email', '==', email)
      .get();
    
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// GET USER BY ID
export async function getUserById(id) {
  try {
    const snap = await usersCollection().doc(id).get();
    if (!snap.exists) return null;
    
    const userData = snap.data();
    // Don't return password
    const { password, ...userWithoutPassword } = userData;
    
    return {
      id: snap.id,
      ...userWithoutPassword
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// VERIFY PASSWORD
export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(error.message);
  }
}

// GET ALL USERS (for admin purposes)
export async function getAllUsers() {
  try {
    const snapshot = await usersCollection().get();
    return snapshot.docs.map(doc => {
      const userData = doc.data();
      // Remove password from response
      const { password, ...userWithoutPassword } = userData;
      return {
        id: doc.id,
        ...userWithoutPassword
      };
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

//FORGOT PASSWORD - Generate reset token
export async function generatePasswordResetToken(email) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token to user document
    await usersCollection().doc(user.id).update({
      resetToken: resetTokenHash,
      resetTokenExpiry: resetTokenExpiry
    });

    return {
      id: user.id,
      email: user.email,
      resetToken: resetToken // Return plain token to send in email
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Verify password reset token
export async function verifyPasswordResetToken(email, resetToken) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if token exists and hasn't expired
    if (!user.resetToken || !user.resetTokenExpiry) {
      throw new Error('No reset token found');
    }

    if (Date.now() > user.resetTokenExpiry) {
      throw new Error('Reset token has expired');
    }

    // Verify token matches
    const isValidToken = await bcrypt.compare(resetToken, user.resetToken);
    if (!isValidToken) {
      throw new Error('Invalid reset token');
    }

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Reset password with token
export async function resetPasswordWithToken(email, resetToken, newPassword) {
  try {
    // Verify token first
    const user = await verifyPasswordResetToken(email, resetToken);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await usersCollection().doc(user.id).update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: Date.now()
    });

    return {
      id: user.id,
      email: user.email,
      message: 'Password reset successfully'
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Change password for logged-in user
export async function changePassword(userId, currentPassword, newPassword) {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get full user with password
    const userWithPassword = await usersCollection().doc(userId).get();
    if (!userWithPassword.exists) {
      throw new Error('User not found');
    }

    const userData = userWithPassword.data();

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userData.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await usersCollection().doc(userId).update({
      password: hashedPassword,
      updatedAt: Date.now()
    });

    return {
      id: user.id,
      email: user.email,
      message: 'Password changed successfully'
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
