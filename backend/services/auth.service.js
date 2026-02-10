import { db } from '../config/firebase.js';
import bcrypt from 'bcryptjs';

const usersCollection = () => db().collection('users');

// CREATE USER
export async function createUser(userData) {
  try {
    const { email, name, password } = userData;
    
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
