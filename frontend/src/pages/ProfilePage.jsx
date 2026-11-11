import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PersonRounded as PersonIcon,
  EmailRounded as EmailIcon,
  SecurityRounded as SecurityIcon,
  ExtensionRounded as ExtensionIcon,
  CheckCircleOutlineRounded as CheckIcon,
  LogoutRounded as LogoutIcon,
  SaveRounded as SaveIcon,
  StorageRounded as DbIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
        setName(data.name || '');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name cannot be blank');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to set a new password');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await authService.updateProfile(name, currentPassword, newPassword);
      setProfile(updated);
      updateUser(updated);
      setSuccess('Profile updated successfully!');
      showToast('Profile updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Update profile error:', err);
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          User Profile & Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account credentials, view connected interfaces, and configure Chrome Extension integration.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Account Summary & Stats */}
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#4f46e5',
                  fontSize: '2rem',
                  fontWeight: 700,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
                }}
              >
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {profile?.name || user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {profile?.email || user?.email}
              </Typography>

              <Chip
                label={profile?.role || 'ROLE_USER'}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Total AI
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4f46e5' }}>
                    {profile?.totalGenerations || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Replies
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                    {profile?.totalReplies || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Summaries
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                    {profile?.totalSummaries || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Chrome Extension Setup Guide Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <ExtensionIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Chrome Extension Setup
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Load the SmartMail AI extension to inject "AI Reply" directly into Gmail:
              </Typography>

              <List dense disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28, color: '#6366f1' }}>1.</ListItemIcon>
                  <ListItemText
                    primary="Open Chrome and navigate to chrome://extensions/"
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28, color: '#6366f1' }}>2.</ListItemIcon>
                  <ListItemText
                    primary="Enable 'Developer mode' toggle in top-right"
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28, color: '#6366f1' }}>3.</ListItemIcon>
                  <ListItemText
                    primary="Click 'Load unpacked' and select the chrome-extension directory"
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28, color: '#6366f1' }}>4.</ListItemIcon>
                  <ListItemText
                    primary="Open Gmail: a '✨ AI Reply' button will appear on email threads!"
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Update Profile & Change Password */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Account Information & Security
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleUpdate} noValidate>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  sx={{ mb: 2.5 }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  value={profile?.email || user?.email || ''}
                  disabled
                  helperText="Email cannot be changed once registered"
                  sx={{ mb: 3 }}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#334155' }}>
                  Change Password (Leave blank to keep current)
                </Typography>

                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={saving}
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={saving}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={saving}
                  sx={{ fontWeight: 700, py: 1.2, px: 3 }}
                >
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
