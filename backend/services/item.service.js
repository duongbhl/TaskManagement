import { db } from '../config/firebase.js';

const col = () => db().collection('tasks');


// POST - CREATE
export async function createTask(data, userId) {
  const ref = col().doc();
  const task = {
    ...data,
    ownerId: userId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await ref.set(task);
  return { id: ref.id, ...task };
}


// GET - LIST ALL
export async function getAllTasks(user) {
    try {
        let query = col().orderBy('createdAt', 'desc');
        
        // If user is not admin, only show their own tasks
        if (user && user.role !== 'admin') {
          query = query.where('ownerId', '==', user.id);
        }
        
        const snapshot = await query.get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.log(error);
        throw error;
    }
}


// GET - SINGLE
export async function getTask(id) {
  const snap = await col().doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}


// PUT
export async function updateTask(id, patch, user) {
  try {
    console.log(`📝 Service: Updating task ${id}`);
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.error(`❌ Service: Task ${id} does not exist`);
      return null;
    }

    const taskData = snap.data();
    
    // Check ownership (admin can update any task, users can only update their own)
    if (user.role !== 'admin' && taskData.ownerId !== user.id) {
      throw new Error('You do not have permission to update this task');
    }

    console.log(`📝 Service: Current task data:`, taskData);
    await ref.update({ ...patch, updatedAt: Date.now() });
    const updated = await ref.get();
    console.log(`✅ Service: Task ${id} updated:`, updated.data());
    return { id: updated.id, ...updated.data() };
  } catch (error) {
    console.error(`❌ Service: Update task ${id} error:`, error.message);
    throw error;
  }
}


// DELETE
export async function deleteTask(id, user) {
  try {
    console.log(`🗑️ Service: Deleting task ${id}`);
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.error(`❌ Service: Task ${id} does not exist for deletion`);
      return false;
    }

    const taskData = snap.data();
    
    // Check ownership (admin can delete any task, users can only delete their own)
    if (user.role !== 'admin' && taskData.ownerId !== user.id) {
      throw new Error('You do not have permission to delete this task');
    }

    await ref.delete();
    console.log(`✅ Service: Task ${id} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Service: Delete task ${id} error:`, error.message);
    throw error;
  }
}