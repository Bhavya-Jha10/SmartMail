import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Tooltip,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import {
  SearchRounded as SearchIcon,
  ContentCopyRounded as CopyIcon,
  DeleteOutlineRounded as DeleteIcon,
  VisibilityRounded as ViewIcon,
  RedoRounded as ReuseIcon,
  FilterListRounded as FilterIcon,
  HistoryRounded as HistoryIcon,
} from '@mui/icons-material';
import { useToast } from '../context/ToastContext';
import { emailService } from '../services/emailService';

const HistoryPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [toneFilter, setToneFilter] = useState('ALL');

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Delete Confirm Dialog
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await emailService.getHistory({
        page: page - 1,
        size: 8,
        search: searchTerm,
        type: typeFilter !== 'ALL' ? typeFilter : '',
        tone: toneFilter !== 'ALL' ? toneFilter : '',
      });

      setHistory(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      showToast('Could not fetch email history', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, typeFilter, toneFilter, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await emailService.deleteHistory(deleteId);
      showToast('Record deleted successfully', 'success');
      setOpenDeleteDialog(false);
      setDeleteId(null);
      fetchHistory();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete history record', 'error');
    }
  };

  const handleReuse = (item) => {
    if (item.generationType === 'REPLY') {
      navigate('/reply-generator', { state: { originalContent: item.originalContent, tone: item.tone } });
    } else {
      navigate('/summarizer', { state: { emailContent: item.originalContent } });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Generation History & Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review, reuse, copy, or purge past AI-generated email responses and structured summaries.
        </Typography>
      </Box>

      {/* Filter Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search history by keyword..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 240 }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Type"
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="REPLY">Replies</MenuItem>
                <MenuItem value="SUMMARY">Summaries</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="tone-filter-label">Tone</InputLabel>
              <Select
                labelId="tone-filter-label"
                value={toneFilter}
                label="Tone"
                onChange={(e) => {
                  setToneFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="ALL">All Tones</MenuItem>
                <MenuItem value="Professional">Professional</MenuItem>
                <MenuItem value="Formal">Formal</MenuItem>
                <MenuItem value="Friendly">Friendly</MenuItem>
                <MenuItem value="Casual">Casual</MenuItem>
                <MenuItem value="Apologetic">Apologetic</MenuItem>
                <MenuItem value="Persuasive">Persuasive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={52} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : history.length > 0 ? (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tone / Mode</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Original Snippet</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Generated Snippet</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((row) => (
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
                          {row.tone || 'Analytical'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {row.originalContent}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography variant="body2" color="text.primary" noWrap>
                          {row.generatedContent}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(row.createdAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Full Details">
                            <IconButton size="small" onClick={() => handleOpenDetail(row)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy Generated Text">
                            <IconButton size="small" onClick={() => handleCopy(row.generatedContent)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reuse in Generator">
                            <IconButton size="small" onClick={() => handleReuse(row)}>
                              <ReuseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Entry">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setDeleteId(row.id);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
                No history records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate AI email replies or summaries to populate your history log.
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Generation Details #{selectedItem?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip label={`Type: ${selectedItem.generationType}`} color="primary" size="small" />
                {selectedItem.tone && <Chip label={`Tone: ${selectedItem.tone}`} size="small" />}
                {selectedItem.responseLength && <Chip label={`Length: ${selectedItem.responseLength}`} size="small" />}
                <Chip label={new Date(selectedItem.createdAt).toLocaleString()} size="small" variant="outlined" />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>
                  Original Source Email:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: '#f8fafc', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}
                >
                  <Typography variant="body2">{selectedItem.originalContent}</Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>
                  AI Generated Output:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: '#f1f5f9', whiteSpace: 'pre-wrap', maxHeight: 260, overflowY: 'auto' }}
                >
                  <Typography variant="body2">{selectedItem.generatedContent}</Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={() => {
              handleCopy(selectedItem?.generatedContent);
              setOpenModal(false);
            }}
          >
            Copy Generated Text
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this generation record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryPage;
