import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  AutoAwesomeRounded as GenerateIcon,
  ContentCopyRounded as CopyIcon,
  RefreshRounded as RegenerateIcon,
  CheckCircleRounded as CheckIcon,
  ClearAllRounded as ClearIcon,
  TuneRounded as SettingsIcon,
  EditNoteRounded as EditIcon,
} from '@mui/icons-material';
import { useToast } from '../context/ToastContext';
import { emailService } from '../services/emailService';

const TONES = [
  'Professional',
  'Formal',
  'Friendly',
  'Casual',
  'Apologetic',
  'Persuasive',
];

const LENGTHS = [
  { value: 'Short', label: 'Short (1-2 concise paragraphs)' },
  { value: 'Medium', label: 'Medium (Balanced 2-3 paragraphs)' },
  { value: 'Detailed', label: 'Detailed (Comprehensive breakdown)' },
];

const ReplyGeneratorPage = () => {
  const { showToast } = useToast();

  const [originalContent, setOriginalContent] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [alternativeCount, setAlternativeCount] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generated state
  const [generatedReply, setGeneratedReply] = useState('');
  const [alternativeReplies, setAlternativeReplies] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [savedId, setSavedId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!originalContent.trim()) {
      setError('Please paste or write the original email content first.');
      return;
    }

    setLoading(true);
    setError('');
    setIsCopied(false);

    try {
      const response = await emailService.generateReply({
        originalContent,
        senderName: senderName.trim() || undefined,
        recipientName: recipientName.trim() || undefined,
        tone,
        length,
        additionalInstructions: additionalInstructions.trim() || undefined,
        alternativeCount,
        saveToHistory: true,
      });

      setGeneratedReply(response.generatedReply);
      setAlternativeReplies(response.alternativeReplies || []);
      setSavedId(response.id);
      setActiveTab(0);
      showToast('AI Reply generated successfully!', 'success');
    } catch (err) {
      console.error('Generation error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to generate email reply. Verify your Gemini API key in backend environment or application.properties.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOriginalContent('');
    setSenderName('');
    setRecipientName('');
    setAdditionalInstructions('');
    setGeneratedReply('');
    setAlternativeReplies([]);
    setSavedId(null);
    setError('');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast('Reply copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // List of all reply options (primary + alternatives)
  const allReplies = [generatedReply, ...alternativeReplies].filter(Boolean);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          AI Email Reply Generator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Transform incoming emails into polished, context-aware responses with customizable tone and length.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Email Input & Prompt Configurations */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Original Email Content <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<ClearIcon />}
                  onClick={handleClear}
                  sx={{ color: '#64748b', fontSize: '0.8rem' }}
                >
                  Clear All
                </Button>
              </Box>

              <TextField
                multiline
                rows={7}
                fullWidth
                placeholder="Paste the email you received here... e.g. 'Hi Team, could you please review the Q3 budget proposal and provide feedback by Thursday at 3 PM?'"
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                disabled={loading}
                sx={{ mb: 2.5 }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SettingsIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Response Settings & Personas
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="tone-label">Tone</InputLabel>
                    <Select
                      labelId="tone-label"
                      value={tone}
                      label="Tone"
                      onChange={(e) => setTone(e.target.value)}
                      disabled={loading}
                    >
                      {TONES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="length-label">Length</InputLabel>
                    <Select
                      labelId="length-label"
                      value={length}
                      label="Length"
                      onChange={(e) => setLength(e.target.value)}
                      disabled={loading}
                    >
                      {LENGTHS.map((l) => (
                        <MenuItem key={l.value} value={l.value}>
                          {l.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Sender Name (Optional)"
                    placeholder="e.g. John Smith"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Recipient / Your Name (Optional)"
                    placeholder="e.g. Alice"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Additional Instructions (Optional)"
                    placeholder="e.g. Agree to the meeting, request zoom link"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="variations-label">Variations</InputLabel>
                    <Select
                      labelId="variations-label"
                      value={alternativeCount}
                      label="Variations"
                      onChange={(e) => setAlternativeCount(Number(e.target.value))}
                      disabled={loading}
                    >
                      <MenuItem value={1}>1 Option</MenuItem>
                      <MenuItem value={2}>2 Options</MenuItem>
                      <MenuItem value={3}>3 Options</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GenerateIcon />}
                onClick={handleGenerate}
                disabled={loading || !originalContent.trim()}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                {loading ? 'Generating AI Reply with Gemini...' : 'Generate AI Reply'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Generated Reply Output & Editor */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Generated Response
                  </Typography>
                </Box>
                {savedId && (
                  <Chip
                    icon={<CheckIcon sx={{ fontSize: 16 }} />}
                    label="Saved to Database"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              {allReplies.length > 1 && (
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  sx={{ mb: 2, borderBottom: '1px solid #e2e8f0' }}
                >
                  {allReplies.map((_, idx) => (
                    <Tab key={idx} label={`Option ${idx + 1}`} sx={{ fontWeight: 600, fontSize: '0.85rem' }} />
                  ))}
                </Tabs>
              )}

              {allReplies.length > 0 ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <TextField
                    multiline
                    rows={12}
                    fullWidth
                    value={allReplies[activeTab] || ''}
                    onChange={(e) => {
                      const updated = [...allReplies];
                      updated[activeTab] = e.target.value;
                      if (activeTab === 0) setGeneratedReply(e.target.value);
                      else {
                        const newAlts = [...alternativeReplies];
                        newAlts[activeTab - 1] = e.target.value;
                        setAlternativeReplies(newAlts);
                      }
                    }}
                    sx={{
                      flexGrow: 1,
                      mb: 2,
                      '& .MuiInputBase-root': {
                        backgroundColor: '#f8fafc',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                      },
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<RegenerateIcon />}
                      onClick={handleGenerate}
                      disabled={loading}
                      size="medium"
                    >
                      Regenerate
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        variant="contained"
                        startIcon={isCopied ? <CheckIcon /> : <CopyIcon />}
                        onClick={() => handleCopy(allReplies[activeTab])}
                        color={isCopied ? 'success' : 'primary'}
                        size="medium"
                      >
                        {isCopied ? 'Copied!' : 'Copy to Clipboard'}
                      </Button>
                    </Box>
                  </Box>
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
                  <GenerateIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                    No reply generated yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                    Enter an incoming email on the left panel, choose your desired tone and length, then click "Generate AI Reply".
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

export default ReplyGeneratorPage;
