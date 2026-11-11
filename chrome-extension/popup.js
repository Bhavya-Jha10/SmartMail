/**
 * SmartMail AI - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const statusPill = document.getElementById('status-pill');
  const authSection = document.getElementById('auth-section');
  const userSection = document.getElementById('user-section');
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  // User elements
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Quick Reply elements
  const quickReplyInput = document.getElementById('quick-reply-input');
  const quickReplyTone = document.getElementById('quick-reply-tone');
  const quickReplyBtn = document.getElementById('quick-reply-btn');
  const quickReplyOutput = document.getElementById('quick-reply-output');
  const quickReplyText = document.getElementById('quick-reply-text');
  const quickCopyReplyBtn = document.getElementById('quick-copy-reply-btn');

  // Quick Summarize elements
  const quickSumInput = document.getElementById('quick-sum-input');
  const quickSumBtn = document.getElementById('quick-sum-btn');
  const quickSumOutput = document.getElementById('quick-sum-output');
  const quickSumText = document.getElementById('quick-sum-text');
  const quickCopySumBtn = document.getElementById('quick-copy-sum-btn');

  // Settings
  const settingBackendUrl = document.getElementById('setting-backend-url');
  const saveSettingsBtn = document.getElementById('save-settings-btn');

  // 1. Check Server Connection

  const checkHealth = async () => {
    const { backendUrl = 'http://localhost:8080' } =
        await chrome.storage.local.get('backendUrl');

    settingBackendUrl.value = backendUrl;

    try {
      const res = await fetch(`${backendUrl}/`, {
        method: 'GET'
      });

      if (res.ok || res.status === 401) {
        statusPill.textContent = 'API Online';
        statusPill.className = 'status-pill online';
      } else {
        statusPill.textContent = 'API Error';
        statusPill.className = 'status-pill offline';
      }
    } catch (error) {
      statusPill.textContent = 'Offline';
      statusPill.className = 'status-pill offline';
    }
  };


  await checkHealth();

  // 2. Check Auth State
  const checkAuth = async () => {
    const { token, user } = await chrome.storage.local.get(['token', 'user']);

    if (token && user) {
      authSection.style.display = 'none';
      userSection.style.display = 'block';

      userName.textContent = user.name || 'User';
      userEmail.textContent = user.email || '';
      userAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();
    } else {
      authSection.style.display = 'block';
      userSection.style.display = 'none';
    }
  };

  await checkAuth();

  // 3. Tab Navigation
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(`tab-${btn.dataset.tab}`);
      if (target) target.classList.add('active');
    });
  });

  // 4. Handle Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    const { backendUrl = 'http://localhost:8080' } = await chrome.storage.local.get('backendUrl');

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.value.trim(),
          password: loginPassword.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await chrome.storage.local.set({
        token: data.token,
        user: { id: data.id, name: data.name, email: data.email, role: data.role },
      });

      loginEmail.value = '';
      loginPassword.value = '';
      await checkAuth();
    } catch (err) {
      loginError.textContent = err.message;
      loginError.style.display = 'block';
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In with Account';
    }
  });

  // 5. Handle Logout
  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'user']);
    await checkAuth();
  });

  // 6. Handle Quick Reply
  quickReplyBtn.addEventListener('click', async () => {
    const text = quickReplyInput.value.trim();
    if (!text) return alert('Please enter an email snippet');

    quickReplyBtn.disabled = true;
    quickReplyBtn.textContent = 'Generating...';

    const { token } = await chrome.storage.local.get('token');

    chrome.runtime.sendMessage(
      {
        action: 'GENERATE_REPLY',
        payload: {
          originalContent: text,
          tone: quickReplyTone.value,
          length: 'Medium',
          saveToHistory: true,
        },
        token,
      },
      (res) => {
        quickReplyBtn.disabled = false;
        quickReplyBtn.textContent = 'Generate';

        if (res.success) {
          quickReplyText.value = res.data.generatedReply;
          quickReplyOutput.style.display = 'block';
        } else {
          alert('Error: ' + res.error);
        }
      }
    );
  });

  quickCopyReplyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(quickReplyText.value);
    quickCopyReplyBtn.textContent = '✔ Copied';
    setTimeout(() => (quickCopyReplyBtn.textContent = 'Copy Reply'), 2000);
  });

  // 7. Handle Quick Summarize
  quickSumBtn.addEventListener('click', async () => {
    const text = quickSumInput.value.trim();
    if (!text) return alert('Please enter email content');

    quickSumBtn.disabled = true;
    quickSumBtn.textContent = 'Summarizing...';

    const { token } = await chrome.storage.local.get('token');

    chrome.runtime.sendMessage(
      {
        action: 'SUMMARIZE',
        payload: {
          emailContent: text,
          saveToHistory: true,
        },
        token,
      },
      (res) => {
        quickSumBtn.disabled = false;
        quickSumBtn.textContent = 'Summarize Insights';

        if (res.success) {
          const d = res.data;
          let html = `<strong>Summary:</strong> ${d.summary}<br><br>`;
          if (d.mainPoints?.length) html += `<strong>Key Points:</strong><br>• ${d.mainPoints.join('<br>• ')}<br><br>`;
          if (d.actionItems?.length) html += `<strong>Actions:</strong><br>☑ ${d.actionItems.join('<br>☑ ')}<br><br>`;
          if (d.deadlines?.length) html += `<strong>Deadlines:</strong> ${d.deadlines.join(', ')}`;

          quickSumText.innerHTML = html;
          quickSumOutput.style.display = 'block';
        } else {
          alert('Error: ' + res.error);
        }
      }
    );
  });

  quickCopySumBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(quickSumText.innerText);
    quickCopySumBtn.textContent = '✔ Copied';
    setTimeout(() => (quickCopySumBtn.textContent = 'Copy Summary'), 2000);
  });

  // 8. Save Settings
  saveSettingsBtn.addEventListener('click', async () => {
    const val = settingBackendUrl.value.trim();
    if (val) {
      await chrome.storage.local.set({ backendUrl: val });
      alert('Settings saved!');
      await checkHealth();
    }
  });
});
