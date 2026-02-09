import { createTask, getAllTasks, getTask, updateTask, deleteTask } from "../services/item.service.js";


export async function create(req, reply) {
  try {
    const task = await createTask(req.body);
    return reply.code(201).send(task);
  } catch (error) {
    return reply.code(400).send({ message: 'Failed to create task', error: error.message });
  }
}

export async function getAll(reg, res) {
    const tasks = await getAllTasks();
    return res.send(tasks)    
}

export async function get(req, reply) {
  const { id } = req.params;
  const task = await getTask(id);
  if (!task) return reply.code(404).send({ message: 'Task not found' });
  return reply.send(task);
}

export async function update(req, reply) {
  const { id } = req.params;
  console.log(`\ud83d\udcdd Updating task ID: ${id}`, 'Body:', req.body);
  try {
    const task = await updateTask(id, req.body);
    if (!task) {
      console.error(`\u274c Task ID ${id} not found`);
      return reply.code(404).send({ message: 'Task not found' });
    }
    console.log(`\u2705 Task ID ${id} updated successfully:`, task);
    return reply.send(task);
  } catch (error) {
    console.error(`\u274c Update task ID ${id} failed:`, error.message);
    return reply.code(400).send({ message: 'Failed to update task', error: error.message });
  }
}

export async function remove(req, reply) {
  const { id } = req.params;
  console.log(`\ud83d\uddd1\ufe0f Deleting task ID: ${id}`);
  try {
    const ok = await deleteTask(id);
    if (!ok) {
      console.error(`\u274c Task ID ${id} not found for deletion`);
      return reply.code(404).send({ message: 'Task not found' });
    }
    console.log(`\u2705 Task ID ${id} deleted successfully`);
    return reply.code(200).send({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`\u274c Delete task ID ${id} failed:`, error.message);
    return reply.code(400).send({ message: 'Failed to delete task', error: error.message });
  }
}