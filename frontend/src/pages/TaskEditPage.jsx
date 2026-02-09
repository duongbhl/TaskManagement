import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { taskApi } from '../api/task.api';

export default function TaskEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTask();
  }, [id]);

  async function loadTask() {
    try {
      setLoading(true);
      const data = await taskApi.get(id);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setStatus(data.status || 'todo');
      setPriority(data.priority || 'medium');
    } catch (error) {
      console.error('Failed to load task', error);
      toast.error('Task not found');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.warning('Please enter a task title');
      return;
    }

    try {
      setSaving(true);
      await taskApi.update(id, {
        title,
        description,
        status,
        priority
      });
      toast.success('Task updated successfully');
      navigate(`/tasks/${id}`);
    } catch (error) {
      console.error('Failed to update task', error);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        startIcon={<Cancel />}
        onClick={() => navigate('/tasks')}
        variant="text"
        sx={{ alignSelf: 'flex-start' }}
      >
        Cancel
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Edit Task
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Task Title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              required
            />

            <TextField
              fullWidth
              label="Description"
              placeholder="Enter task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              multiline
              rows={5}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>

        <CardActions>
          <Button
            startIcon={<Save />}
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={saving}
            fullWidth
            sx={{ mr: 1 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/tasks')}
            fullWidth
          >
            Cancel
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
}
