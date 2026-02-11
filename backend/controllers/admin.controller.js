import { getAllUsers, getUserById } from "../services/auth.service.js";
import { db } from '../config/firebase.js';

const taskCol = () => db().collection('tasks');

// GET ALL USERS (Admin only)
export async function getAllUsersController(req, reply) {
  try {
    const users = await getAllUsers();
    return reply.send(users);
  } catch (error) {
    return reply.code(500).send({ message: 'Failed to fetch users', error: error.message });
  }
}

// GET ALL TASKS (Admin only) - return all tasks without filtering
export async function getAllTasksAdmin(req, reply) {
  try {
    const snapshot = await taskCol().orderBy('createdAt', 'desc').get();
    const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return reply.send(tasks);
  } catch (error) {
    return reply.code(500).send({ message: 'Failed to fetch tasks', error: error.message });
  }
}

// GET TASKS BY USER ID (Admin only)
export async function getTasksByUserId(req, reply) {
  try {
    const { userId } = req.params;
    const snapshot = await taskCol()
      .where('ownerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return reply.send(tasks);
  } catch (error) {
    return reply.code(500).send({ message: 'Failed to fetch user tasks', error: error.message });
  }
}

// GET USER DETAILS (Admin only)
export async function getUserDetailsAdmin(req, reply) {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    
    // Get user's tasks
    const snapshot = await taskCol()
      .where('ownerId', '==', userId)
      .get();
    
    const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    return reply.send({
      ...user,
      tasks,
      taskCount: tasks.length
    });
  } catch (error) {
    return reply.code(500).send({ message: 'Failed to fetch user details', error: error.message });
  }
}
