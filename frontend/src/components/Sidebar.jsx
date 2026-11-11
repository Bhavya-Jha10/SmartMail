import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DashboardRounded as DashboardIcon,
  AutoAwesomeRounded as ReplyIcon,
  SummarizeRounded as SummarizeIcon,
  HistoryRounded as HistoryIcon,
  PersonRounded as ProfileIcon,
  LogoutRounded as LogoutIcon,
  MarkEmailReadRounded as BrandIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'AI Reply Generator', icon: <ReplyIcon />, path: '/reply-generator' },
  { text: 'Email Summarizer', icon: <SummarizeIcon />, path: '/summarizer' },
  { text: 'History & Logs', icon: <HistoryIcon />, path: '/history' },
  { text: 'Profile & Settings', icon: <ProfileIcon />, path: '/profile' },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out successfully', 'info');
    navigate('/login');
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        borderRight: '1px solid #1e293b',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          <BrandIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            SmartMail <span style={{ color: '#818cf8' }}>AI</span>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            v1.0 • College Edition
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#1e293b', mx: 2 }} />

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.8 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={() => {
                if (mobileOpen) handleDrawerToggle();
              }}
              sx={{
                borderRadius: 2,
                py: 1.2,
                px: 2,
                color: '#94a3b8',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#f8fafc',
                },
                '&.active': {
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  fontWeight: 600,
                  '& .MuiListItemIcon-root': {
                    color: '#818cf8',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#64748b',
                  minWidth: 38,
                  '& svg': { fontSize: 22 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: '#1e293b', mx: 2 }} />

      {/* User Footer */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#090d16',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#4f46e5',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ color: '#f8fafc', fontSize: '0.85rem' }}
            >
              {user?.name || 'User'}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}
            >
              {user?.email || 'user@smartmail.ai'}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Log Out">
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{
              color: '#94a3b8',
              '&:hover': { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            border: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
