import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { adminApi } from '../api/admin.api';
import { authApi } from '../api/auth.api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDetail, setOpenUserDetail] = useState(false);
  const [userTasks, setUserTasks] = useState([]);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const user = authApi.getUser();
    if (!user || user.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/tasks');
    }
  }, [navigate]);

  // Load users
  async function loadUsers() {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  // Load all tasks
  async function loadTasks() {
    try {
      setLoading(true);
      const data = await adminApi.getAllTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  // Load user details
  async function handleViewUserDetails(user) {
    try {
      setUserDetailLoading(true);
      const userDetails = await adminApi.getUserDetails(user.id);
      setSelectedUser(userDetails);
      setUserTasks(userDetails.tasks || []);
      setOpenUserDetail(true);
    } catch (error) {
      console.error('Failed to load user details', error);
      toast.error('Failed to load user details');
    } finally {
      setUserDetailLoading(false);
    }
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      loadUsers();
    } else {
      loadTasks();
    }
  };

  // Load initial data
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Users Management" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="All Tasks" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>
      </Paper>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'admin' ? 'error' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewUserDetails(user)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {users.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No users found
                </Typography>
              </Box>
            )}
          </TableContainer>
        )}
      </TabPanel>

      {/* Tasks Tab */}
      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Owner Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.ownerEmail || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        color={
                          task.status === 'done'
                            ? 'success'
                            : task.status === 'doing'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {tasks.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No tasks found
                </Typography>
              </Box>
            )}
          </TableContainer>
        )}
      </TabPanel>

      {/* User Details Dialog */}
      <Dialog open={openUserDetail} onClose={() => setOpenUserDetail(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          User Details - {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          {userDetailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                User Information
              </Typography>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography>
                  <strong>Email:</strong> {selectedUser?.email}
                </Typography>
                <Typography>
                  <strong>Name:</strong> {selectedUser?.name}
                </Typography>
                <Typography>
                  <strong>Role:</strong>{' '}
                  <Chip
                    label={selectedUser?.role}
                    color={selectedUser?.role === 'admin' ? 'error' : 'primary'}
                    size="small"
                  />
                </Typography>
                <Typography>
                  <strong>Task Count:</strong> {selectedUser?.taskCount || 0}
                </Typography>
                <Typography>
                  <strong>Created:</strong>{' '}
                  {selectedUser?.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>
                User Tasks ({userTasks.length})
              </Typography>
              {userTasks.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.status}
                              color={
                                task.status === 'done'
                                  ? 'success'
                                  : task.status === 'doing'
                                  ? 'warning'
                                  : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(task.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">
                  No tasks found for this user
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
