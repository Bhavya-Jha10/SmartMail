import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  Divider,
} from '@mui/material';
import {
  MenuRounded as MenuIcon,
  AutoAwesomeRounded as ReplyIcon,
  PersonRounded as ProfileIcon,
  LogoutRounded as LogoutIcon,
  CircleRounded as StatusDotIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DRAWER_WIDTH } from './Sidebar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/reply-generator': 'AI Email Reply Generator',
  '/summarizer': 'Intelligent Email Summarizer',
  '/history': 'Generation History & Logs',
  '/profile': 'User Profile & Settings',
};

const Navbar = ({ handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const title = PAGE_TITLES[location.pathname] || 'SmartMail AI';

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: 70, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' }, color: '#64748b' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* API Server Status Indicator */}
          <Chip
            icon={<StatusDotIcon sx={{ fontSize: 10, color: '#10b981 !important' }} />}
            label="API Online"
            size="small"
            sx={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontWeight: 600,
              fontSize: '0.75rem',
              display: { xs: 'none', sm: 'inline-flex' },
              border: '1px solid #a7f3d0',
            }}
          />

          {/* Quick Action Button */}
          {location.pathname !== '/reply-generator' && (
            <Button
              variant="contained"
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() => navigate('/reply-generator')}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                fontSize: '0.825rem',
                py: 0.8,
                px: 2,
              }}
            >
              Compose Reply
            </Button>
          )}

          {/* User Menu Avatar */}
          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{
              p: 0.5,
              border: '2px solid #e2e8f0',
              '&:hover': { borderColor: '#6366f1' },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#4f46e5',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 4,
              sx: {
                minWidth: 200,
                borderRadius: 3,
                mt: 1.5,
                border: '1px solid #e2e8f0',
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              Profile & Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
              <ListItemIcon sx={{ color: '#ef4444' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
