import { BrowserRouter, Routes, Route, Outlet, Link, useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Container, Toolbar, Typography, Box, Button } from '@mui/material';
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import TaskEditPage from "./pages/TaskEditPage";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  }
});

function AppLayout() {
  const navigate = useNavigate();
  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ cursor: 'pointer', flexGrow: 1 }} onClick={() => navigate('/tasks')}>
            📋 Task Management
          </Typography>
          <Button color="inherit" onClick={() => navigate('/tasks')}>
            Tasks
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <main>
          <Outlet />
        </main>
      </Container>
    </>
  );
}

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>404 - Not Found</Typography>
      <Link to="/tasks">
        <Button variant="contained" color="primary">
          Go to Tasks
        </Button>
      </Link>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Layout */}
          <Route element={<AppLayout />}>
            {/* Home → Show TasksPage */}
            <Route index element={<TasksPage />} />

            {/* Tasks CRUD routes */}
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/tasks/:id/edit" element={<TaskEditPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
