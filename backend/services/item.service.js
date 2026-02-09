import { db } from '../config/firebase.js';

const col = () => db().collection('tasks');


// POST - CREATE
export async function createTask(data) {
  const ref = col().doc();
  const task = {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await ref.set(task);
  return { id: ref.id, ...task };
}


// GET - LIST ALL
export async function getAllTasks() {
    try {
        const data = await col().orderBy('createdAt', 'desc').get();
        return data.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.log(error);

    }
}


// GET - SINGLE
export async function getTask(id) {
  const snap = await col().doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}


// PUT
export async function updateTask(id, patch) {
  try {
    console.log(`\ud83d\udcdd Service: Updating task ${id}`);
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.error(`\u274c Service: Task ${id} does not exist`);
      return null;
    }

    console.log(`\ud83d\udcdd Service: Current task data:`, snap.data());
    await ref.update({ ...patch, updatedAt: Date.now() });
    const updated = await ref.get();
    console.log(`\u2705 Service: Task ${id} updated:`, updated.data());
    return { id: updated.id, ...updated.data() };
  } catch (error) {
    console.error(`\u274c Service: Update task ${id} error:`, error.message);
    throw error;
  }
}


// DELETE
export async function deleteTask(id) {
  try {
    console.log(`\ud83d\uddd1\ufe0f Service: Deleting task ${id}`);
    const ref = col().doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      console.error(`\u274c Service: Task ${id} does not exist for deletion`);
      return false;
    }

    await ref.delete();
    console.log(`\u2705 Service: Task ${id} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`\u274c Service: Delete task ${id} error:`, error.message);
    throw error;
  }
}