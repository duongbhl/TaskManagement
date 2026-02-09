import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import { Edit, ArrowBack } from '@mui/icons-material';
import { taskApi } from '../api/task.api';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [id]);

  async function loadTask() {
    try {
      setLoading(true);
      const data = await taskApi.get(id);
      setTask(data);
    } catch (error) {
      console.error('Failed to load task', error);
      toast.error('Task not found');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">Task not found</Typography>
      </Box>
    );
  }

  const createdAt = new Date(task.createdAt).toLocaleString();
  const updatedAt = new Date(task.updatedAt).toLocaleString();

  const getStatusColor = (status) => status === 'todo' ? 'warning' : 'success';
  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'error';
    if (priority === 'medium') return 'info';
    return 'success';
  };

  return (
    <Stack spacing={3}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/tasks')}
        variant="text"
        sx={{ alignSelf: 'flex-start' }}
      >
        Back to Tasks
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            {task.title}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Chip
              label={`Status: ${task.status.toUpperCase()}`}
              color={getStatusColor(task.status)}
              variant="filled"
            />
            {task.priority && (
              <Chip
                label={`Priority: ${task.priority.toUpperCase()}`}
                color={getPriorityColor(task.priority)}
                variant="filled"
              />
            )}
          </Stack>

          {task.description && (
            <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {task.description}
              </Typography>
            </Paper>
          )}

          <Divider sx={{ my: 3 }} />

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              <strong>Created:</strong> {createdAt}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <strong>Updated:</strong> {updatedAt}
            </Typography>
          </Stack>
        </CardContent>

        <CardActions>
          <Button
            startIcon={<Edit />}
            variant="contained"
            color="warning"
            onClick={() => navigate(`/tasks/${id}/edit`)}
          >
            Edit Task
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/tasks')}
          >
            Close
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
}
