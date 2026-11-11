/**
 * SmartMail AI - Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('SmartMail AI Chrome Extension installed.');
  // Initialize default configuration
  chrome.storage.local.get(['backendUrl', 'defaultTone', 'defaultLength'], (result) => {
    if (!result.backendUrl) {
      chrome.storage.local.set({
        backendUrl: 'http://localhost:8080',
        defaultTone: 'Professional',
        defaultLength: 'Medium',
      });
    }
  });
});

// Centralized message handler for API delegation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GENERATE_REPLY') {
    handleApiRequest('/api/email/generate', 'POST', request.payload, request.token)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'SUMMARIZE') {
    handleApiRequest('/api/email/summarize', 'POST', request.payload, request.token)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'CHECK_HEALTH') {
    chrome.storage.local.get(['backendUrl'], (result) => {
      const url = (result.backendUrl || 'http://localhost:8080') + '/actuator/health';
      fetch(url)
        .then((res) => sendResponse({ online: res.ok }))
        .catch(() => sendResponse({ online: false }));
    });
    return true;
  }
});

async function handleApiRequest(endpoint, method, payload, token) {
  const { backendUrl = 'http://localhost:8080' } = await chrome.storage.local.get('backendUrl');
  const fullUrl = `${backendUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API Error (${response.status})`);
  }

  return data;
}
