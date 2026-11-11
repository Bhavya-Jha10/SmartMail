import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  SummarizeRounded as SummarizeIcon,
  ContentCopyRounded as CopyIcon,
  CheckCircleRounded as CheckIcon,
  ClearAllRounded as ClearIcon,
  CalendarTodayRounded as CalendarIcon,
  HelpOutlineRounded as QuestionIcon,
  TaskAltRounded as ActionIcon,
  FormatListBulletedRounded as PointIcon,
} from '@mui/icons-material';
import { useToast } from '../context/ToastContext';
import { emailService } from '../services/emailService';

const SummarizerPage = () => {
  const { showToast } = useToast();

  const [emailContent, setEmailContent] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Structured Summary Result
  const [summaryData, setSummaryData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSummarize = async (e) => {
    if (e) e.preventDefault();
    if (!emailContent.trim()) {
      setError('Please paste the email content you want to summarize.');
      return;
    }

    setLoading(true);
    setError('');
    setIsCopied(false);

    try {
      const response = await emailService.summarize({
        emailContent,
        additionalInstructions: additionalInstructions.trim() || undefined,
        saveToHistory: true,
      });

      setSummaryData(response);
      showToast('Email summarized successfully!', 'success');
    } catch (err) {
      console.error('Summarize error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to generate email summary. Check backend connection and Gemini API key.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmailContent('');
    setAdditionalInstructions('');
    setSummaryData(null);
    setError('');
  };

  const handleCopy = () => {
    if (!summaryData) return;

    let fullText = `SUMMARY:\n${summaryData.summary}\n\n`;
    if (summaryData.mainPoints?.length > 0) {
      fullText += `MAIN POINTS:\n${summaryData.mainPoints.map((p) => `• ${p}`).join('\n')}\n\n`;
    }
    if (summaryData.actionItems?.length > 0) {
      fullText += `ACTION ITEMS:\n${summaryData.actionItems.map((a) => `[ ] ${a}`).join('\n')}\n\n`;
    }
    if (summaryData.deadlines?.length > 0) {
      fullText += `DEADLINES & DATES:\n${summaryData.deadlines.map((d) => `• ${d}`).join('\n')}\n\n`;
    }
    if (summaryData.questions?.length > 0) {
      fullText += `QUESTIONS NEEDING RESPONSE:\n${summaryData.questions.map((q) => `? ${q}`).join('\n')}\n`;
    }

    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    showToast('Structured summary copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          AI Email Summarizer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quickly extract core takeaways, action items, dates, and questions from lengthy email threads without missing crucial context.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Input Panel */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Email / Thread Content <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                  sx={{ color: '#64748b', fontSize: '0.8rem' }}
                >
                  Clear
                </Button>
              </Box>

              <TextField
                multiline
                rows={11}
                fullWidth
                placeholder="Paste the full email or thread here... (e.g. project announcements, client inquiries, meeting discussions)"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                disabled={loading}
                sx={{ mb: 2.5 }}
              />

              <TextField
                size="small"
                fullWidth
                label="Custom Focus / Instructions (Optional)"
                placeholder="e.g. Focus on budget numbers, or focus on deliverables"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                disabled={loading}
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SummarizeIcon />}
                onClick={handleSummarize}
                disabled={loading || !emailContent.trim()}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                {loading ? 'Analyzing with Gemini AI...' : 'Summarize Email'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Output Panel */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Structured Email Insights
                </Typography>
                {summaryData && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={isCopied ? <CheckIcon /> : <CopyIcon />}
                      onClick={handleCopy}
                      color={isCopied ? 'success' : 'primary'}
                    >
                      {isCopied ? 'Copied' : 'Copy All'}
                    </Button>
                  </Box>
                )}
              </Box>

              {summaryData ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Executive Summary */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      backgroundColor: '#f1f5f9',
                      borderRadius: 2.5,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                      Executive Summary
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#0f172a', lineHeight: 1.6 }}>
                      {summaryData.summary}
                    </Typography>
                  </Paper>

                  {/* Main Points */}
                  {summaryData.mainPoints && summaryData.mainPoints.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PointIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Main Points
                        </Typography>
                      </Box>
                      <List dense disablePadding>
                        {summaryData.mainPoints.map((point, idx) => (
                          <ListItem key={idx} sx={{ px: 1, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24, color: '#6366f1' }}>•</ListItemIcon>
                            <ListItemText primary={point} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Action Items */}
                  {summaryData.actionItems && summaryData.actionItems.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ActionIcon sx={{ color: '#10b981', fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065f46' }}>
                          Action Items
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        {summaryData.actionItems.map((item, idx) => (
                          <Paper
                            key={idx}
                            elevation={0}
                            sx={{
                              p: 1.2,
                              px: 2,
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: 2,
                              fontSize: '0.875rem',
                              color: '#065f46',
                            }}
                          >
                            ☑ {item}
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Deadlines & Dates */}
                  {summaryData.deadlines && summaryData.deadlines.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e' }}>
                          Deadlines & Crucial Dates
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {summaryData.deadlines.map((date, idx) => (
                          <Chip
                            key={idx}
                            icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                            label={date}
                            sx={{
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              fontWeight: 600,
                              border: '1px solid #fde68a',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Questions Requiring Response */}
                  {summaryData.questions && summaryData.questions.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <QuestionIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#5b21b6' }}>
                          Questions Requiring a Response
                        </Typography>
                      </Box>
                      <List dense disablePadding>
                        {summaryData.questions.map((q, idx) => (
                          <ListItem key={idx} sx={{ px: 1, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24, color: '#8b5cf6' }}>?</ListItemIcon>
                            <ListItemText primary={q} primaryTypographyProps={{ fontSize: '0.9rem', color: '#5b21b6' }} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    border: '1.5px dashed #cbd5e1',
                  }}
                >
                  <SummarizeIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    No summary generated yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                    Paste an email thread on the left panel and click "Summarize Email" to generate an executive overview and structured action items.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummarizerPage;
