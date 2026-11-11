import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesomeRounded as ReplyIcon,
  SummarizeRounded as SummarizeIcon,
  HistoryRounded as HistoryIcon,
  TrendingUpRounded as MetricIcon,
  ExtensionRounded as ExtensionIcon,
  ArrowForwardRounded as ArrowForwardIcon,
  ContentCopyRounded as CopyIcon,
  TuneRounded as ToneIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { emailService } from '../services/emailService';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await emailService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        showToast('Could not load recent metrics from server', 'warning');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <Box>
      {/* Welcome Banner */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
            Welcome back, {user?.name || 'User'} 👋
          </Typography>
          <Typography variant="body1" sx={{ color: '#c7d2fe', maxWidth: 600 }}>
            SmartMail AI is ready to draft context-aware replies and extract structured summaries powered by Google Gemini.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<ReplyIcon />}
            onClick={() => navigate('/reply-generator')}
            sx={{
              backgroundColor: '#ffffff',
              color: '#3730a3',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#f5f3ff' },
            }}
          >
            Generate Reply
          </Button>
          <Button
            variant="outlined"
            startIcon={<SummarizeIcon />}
            onClick={() => navigate('/summarizer')}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              fontWeight: 600,
              '&:hover': { borderColor: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Summarize Email
          </Button>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 6,
                height: '100%',
                backgroundColor: '#6366f1',
              }}
            />
            <CardContent sx={{ p: 3, pl: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total AI Generations
                </Typography>
                <MetricIcon sx={{ color: '#6366f1' }} />
              </Box>
              {loading ? (
                <Skeleton width="40%" height={48} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {stats?.totalGenerations || 0}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Total lifetime AI email completions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 6,
                height: '100%',
                backgroundColor: '#10b981',
              }}
            />
            <CardContent sx={{ p: 3, pl: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Replies Drafted
                </Typography>
                <ReplyIcon sx={{ color: '#10b981' }} />
              </Box>
              {loading ? (
                <Skeleton width="40%" height={48} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {stats?.totalReplies || 0}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Context-aware email response threads
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 6,
                height: '100%',
                backgroundColor: '#8b5cf6',
              }}
            />
            <CardContent sx={{ p: 3, pl: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Summaries Created
                </Typography>
                <SummarizeIcon sx={{ color: '#8b5cf6' }} />
              </Box>
              {loading ? (
                <Skeleton width="40%" height={48} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {stats?.totalSummaries || 0}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Structured point & action extractions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tone Breakdown & Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ToneIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Tone Distribution Breakdown
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Most frequently utilized communication tones in your reply workflows
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} width={80} height={32} />
                  ))}
                </Box>
              ) : Object.keys(stats?.toneDistribution || {}).length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {Object.entries(stats.toneDistribution).map(([tone, count]) => (
                    <Chip
                      key={tone}
                      label={`${tone} (${count})`}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: '#eef2ff',
                        color: '#4338ca',
                        border: '1px solid #c7d2fe',
                        py: 2,
                        px: 1,
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No replies generated yet. Start drafting to see your tone analytics!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ExtensionIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Gmail Extension Ready
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Use our Manifest V3 Chrome Extension to generate replies directly in your Gmail inbox without leaving your email tab.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/profile')}
                sx={{ borderRadius: 2, py: 1 }}
              >
                Extension Setup Guide
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity Table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Activity
              </Typography>
            </Box>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/history')}
            >
              View Full History
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ py: 2 }}>
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} height={50} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Table size="medium">
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tone / Length</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Preview</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentActivity.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Chip
                          label={row.generationType}
                          size="small"
                          color={row.generationType === 'REPLY' ? 'primary' : 'secondary'}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.tone || 'Analytical'} • {row.responseLength || 'Concise'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {row.generatedContent}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Copy Generated Text">
                          <IconButton size="small" onClick={() => copyToClipboard(row.generatedContent)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                No recent activity found.
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => navigate('/reply-generator')}
              >
                Create First Reply
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
