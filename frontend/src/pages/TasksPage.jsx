import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Stack,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Done,
  Delete,
} from '@mui/icons-material';
import { taskApi } from '../api/task.api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //get data API call
  async function loadTasks() {
    try {
      setLoading(true);
      const data = await taskApi.list();
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  //fetch data
  useEffect(() => {
    loadTasks();
  }, []);

  //add data API call
  async function handleAddTask() {
    if (!title.trim()) {
      toast.warning('Please enter a task title');
      return;
    }

    try {
      await taskApi.create({
        title,
        description,
        status: 'todo',
        priority: 'medium'
      });
      setTitle('');
      setDescription('');
      loadTasks();
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task', error);
      toast.error('Failed to create task');
    }
  }

  //delete data API call
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskApi.remove(id);
      loadTasks();
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task', error);
      toast.error('Failed to delete task');
    }
  }

  //update data API call
  async function handleStatusChange(id, newStatus) {
    try {
      await taskApi.update(id, { status: newStatus });
      loadTasks();
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Failed to update task', error);
      toast.error('Failed to update task');
    }
  }

  const getStatusColor = (status) => status === 'todo' ? 'warning' : 'success';
  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'error';
    if (priority === 'medium') return 'info';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        📋 Tasks
      </Typography>

      {/* Add New Task */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add New Task
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Task Title"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Description"
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={3}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleAddTask}
            sx={{ alignSelf: 'flex-start' }}
          >
            ➕ Add Task
          </Button>
        </Stack>
      </Paper>

      {/* Tasks List */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : tasks.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            No tasks yet. Create one above!
          </Typography>
        ) : (
          <Stack spacing={2}>
            {tasks.map((task) => (
              <Card
                key={task.id}
                sx={{
                  opacity: task.status === 'done' ? 0.7 : 1,
                  backgroundColor: task.status === 'done' ? '#f5f5f5' : 'white',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={task.status.toUpperCase()}
                      color={getStatusColor(task.status)}
                      variant="filled"
                      size="small"
                    />
                    {task.priority && (
                      <Chip
                        label={task.priority.toUpperCase()}
                        color={getPriorityColor(task.priority)}
                        variant="filled"
                        size="small"
                      />
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    title="View"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    title="Edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleStatusChange(task.id, task.status === 'todo' ? 'done' : 'todo')}
                    title={task.status === 'todo' ? 'Mark Done' : 'Reopen'}
                  >
                    <Done />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(task.id)}
                    title="Delete"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
