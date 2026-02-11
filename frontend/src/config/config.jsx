import { authApi } from "../api/auth.api";
import { AppBar, Container, Toolbar, Typography, Box, Button, Menu, MenuItem, createTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";


export const theme = createTheme({
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

export function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const currentUser = authApi.getUser();
    setUser(currentUser);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    handleMenuClose();
    navigate('/login');
  };

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
          {user && user.role === 'admin' && (
            <Button color="inherit" onClick={() => navigate('/admin')} sx={{ ml: 1 }}>
              Admin
            </Button>
          )}
          {user && (
            <>
              <Typography variant="body2" sx={{ mx: 2 }}>
                {user.name}
              </Typography>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                Menu
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
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

export function ProtectedRoute({ children }) {
  const isAuthenticated = authApi.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export function NotFound() {
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
