import api from './api';

export const emailService = {
  async generateReply({
    originalContent,
    senderName,
    recipientName,
    tone = 'Professional',
    length = 'Medium',
    additionalInstructions,
    alternativeCount = 1,
    saveToHistory = true,
  }) {
    const response = await api.post('/email/generate', {
      originalContent,
      senderName,
      recipientName,
      tone,
      length,
      additionalInstructions,
      alternativeCount,
      saveToHistory,
    });
    return response.data;
  },

  async summarize({ emailContent, additionalInstructions, saveToHistory = true }) {
    const response = await api.post('/email/summarize', {
      emailContent,
      additionalInstructions,
      saveToHistory,
    });
    return response.data;
  },

  async getHistory({ page = 0, size = 10, search = '', type = '', tone = '' }) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (tone) params.append('tone', tone);

    const response = await api.get(`/email/history?${params.toString()}`);
    return response.data;
  },

  async getHistoryById(id) {
    const response = await api.get(`/email/history/${id}`);
    return response.data;
  },

  async deleteHistory(id) {
    const response = await api.delete(`/email/history/${id}`);
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/email/stats');
    return response.data;
  },
};
