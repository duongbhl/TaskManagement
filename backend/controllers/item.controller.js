import { createTask, getAllTasks, getTask, updateTask, deleteTask } from "../services/item.service.js";


export async function create(req, reply) {
  try {
    // Ensure ownerId is always set from authenticated user
    const task = await createTask(req.body, req.user.id);
    return reply.code(201).send(task);
  } catch (error) {
    console.error('❌ Create task failed:', error.message);
    return reply.code(400).send({ message: 'Failed to create task', error: error.message });
  }
}

export async function getAll(req, res) {
  try {
    const tasks = await getAllTasks(req.user);
    return res.send(tasks);
  } catch (error) {
    console.error('❌ Get all tasks failed:', error.message);
    return res.code(400).send({ message: 'Failed to load tasks', error: error.message });
  }
}

export async function get(req, reply) {
  const { id } = req.params;
  const task = await getTask(id);
  if (!task) return reply.code(404).send({ message: 'Task not found' });
  return reply.send(task);
}

export async function update(req, reply) {
  const { id } = req.params;
  console.log(`📝 Updating task ID: ${id}`, 'Body:', req.body);
  try {
    const task = await updateTask(id, req.body, req.user);
    if (!task) {
      console.error(`❌ Task ID ${id} not found`);
      return reply.code(404).send({ message: 'Task not found' });
    }
    console.log(`✅ Task ID ${id} updated successfully:`, task);
    return reply.send(task);
  } catch (error) {
    console.error(`❌ Update task ID ${id} failed:`, error.message);
    return reply.code(400).send({ message: 'Failed to update task', error: error.message });
  }
}

export async function remove(req, reply) {
  const { id } = req.params;
  console.log(`🗑️ Deleting task ID: ${id}`);
  try {
    const ok = await deleteTask(id, req.user);
    if (!ok) {
      console.error(`❌ Task ID ${id} not found for deletion`);
      return reply.code(404).send({ message: 'Task not found' });
    }
    console.log(`✅ Task ID ${id} deleted successfully`);
    return reply.code(200).send({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`❌ Delete task ID ${id} failed:`, error.message);
    return reply.code(400).send({ message: 'Failed to delete task', error: error.message });
  }
}