import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { initializeApp, cert } from 'firebase-admin/app.js';
import { getFirestore } from 'firebase-admin/firestore.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Firebase
let db;
try {
  const credentials = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
  });
  
  initializeApp({ credential: credentials });
  db = getFirestore();
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
}

// Helper: Get users collection
const getUsersCollection = () => db.collection('users');

// Helper: Verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Backend is running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const existingUser = await getUsersCollection().where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcryptjs.hash(password, 10);
    const userRef = await getUsersCollection().add({
      email,
      name,
      password: hashedPassword,
      role: 'user',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userRef.id, email, name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const userSnap = await getUsersCollection().where('email', '==', email).get();
    if (userSnap.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = userSnap.docs[0];
    const userData = user.data();
    
    const isValidPassword = await bcryptjs.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: userData.email, name: userData.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const userSnap = await getUsersCollection().doc(req.user.userId).get();
    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userSnap.data();
    const { password, ...userWithoutPassword } = userData;
    
    res.json({ user: { id: userSnap.id, ...userWithoutPassword } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const userSnap = await getUsersCollection().where('email', '==', email).get();
    if (userSnap.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
app.post('/api/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const userSnap = await getUsersCollection().doc(req.user.userId).get();
    if (!userSnap.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userSnap.data();
    const isValidPassword = await bcryptjs.compare(currentPassword, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await getUsersCollection().doc(req.user.userId).update({
      password: hashedPassword,
      updatedAt: Date.now()
    });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export for Vercel
export default app;
