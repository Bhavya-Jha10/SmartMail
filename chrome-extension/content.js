/**
 * SmartMail AI - Gmail Content Script (Manifest V3)
 * Detects opened emails, injects AI Reply button, extracts text, calls backend, and inserts replies.
 */

(function () {
  'use strict';

  const SMARTMAIL_ATTR = 'data-smartmail-injected';
  const MODAL_ID = 'smartmail-ai-modal-overlay';

  console.log('[SmartMail AI] Content script active on Gmail.');

  // Initialize MutationObserver to watch Gmail's dynamic DOM updates
  const observer = new MutationObserver(() => {
    injectAiReplyButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial check


  function injectAiReplyButtons() {
    const composeToolbars = document.querySelectorAll(
        'tr.btC, div.btC, .gU.Up, div[role="region"] .btC, .aDh'
    );

    composeToolbars.forEach((toolbar) => {
      const sendButton = toolbar.querySelector(
          '[role="button"][data-tooltip*="Send"], .T-I-KE, .aoO'
      );

      if (!sendButton || !sendButton.parentNode) return;

      const buttonContainer = sendButton.parentNode;

      // Only one SmartMail button on the current Gmail page
      if (document.querySelector('.smartmail-ai-btn')) return;

      const aiBtn = createAiButton(() => handleAiReplyClick(toolbar));

      buttonContainer.insertBefore(aiBtn, sendButton.nextSibling);

      toolbar.setAttribute(SMARTMAIL_ATTR, 'true');
    });
  }


  /**
   * Creates a stylized AI Reply button matching Gmail design guidelines.
   */
  function createAiButton(onClickHandler) {
    const btn = document.createElement('button');
    btn.className = 'smartmail-ai-btn';
    btn.type = 'button';
    btn.innerHTML = `
      <span style="font-size: 14px; margin-right: 4px;">✨</span>
      <span>AI Reply</span>
    `;

    // Inline styling for resilient presentation across Gmail themes
    btn.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 6px;
      padding: 0 14px;
      height: 36px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      border: none;
      border-radius: 18px;
      font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.35);
      transition: all 0.2s ease;
      vertical-align: middle;
      z-index: 10;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.5)';
      btn.style.transform = 'translateY(-1px)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = '0 2px 6px rgba(79, 70, 229, 0.35)';
      btn.style.transform = 'translateY(0)';
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClickHandler();
    });

    return btn;
  }

  /**
   * Extracts text content of the active email thread.
   */
  function extractEmailContent() {
    // Selectors for message bodies in opened Gmail view
    const messageBodies = document.querySelectorAll(
      '.ii.gt div[dir="ltr"], .a3s.aiL, div[role="listitem"] .a3s, div[data-message-id] .a3s'
    );

    if (messageBodies.length > 0) {
      // Pick the last visible email in the thread (most recent)
      const lastMessage = messageBodies[messageBodies.length - 1];
      const text = lastMessage.innerText || lastMessage.textContent;
      if (text && text.trim().length > 5) {
        return text.trim();
      }
    }

    // Fallback: check all .a3s elements
    const fallbackElements = document.querySelectorAll('.a3s');
    for (let i = fallbackElements.length - 1; i >= 0; i--) {
      const text = fallbackElements[i].innerText;
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    }

    return '';
  }

  /**
   * Handles user click on AI Reply button.
   */
  async function handleAiReplyClick(contextElement) {
    const emailText = extractEmailContent();

    if (!emailText) {
      alert(
        '[SmartMail AI] Could not detect email text in this view. Please ensure an email conversation is opened.'
      );
      return;
    }

    // Check if user is logged into extension
    const storage = await chrome.storage.local.get(['token', 'backendUrl', 'defaultTone', 'defaultLength']);
    const token = storage.token;
    const backendUrl = storage.backendUrl || 'http://localhost:8080';
    const defaultTone = storage.defaultTone || 'Professional';
    const defaultLength = storage.defaultLength || 'Medium';

    openAiModal({
      emailText,
      token,
      backendUrl,
      defaultTone,
      defaultLength,
      contextElement,
    });
  }

  /**
   * Opens the in-Gmail SmartMail AI interactive modal dialog.
   */
  function openAiModal(config) {
    // Remove existing modal if open
    const existing = document.getElementById(MODAL_ID);
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: #ffffff;
      width: 580px;
      max-width: 90vw;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: smartmailFadeIn 0.2s ease-out;
    `;

    // Modal HTML layout
    card.innerHTML = `
      <div style="background: #0f172a; color: #fff; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #4f46e5); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            ✨
          </div>
          <div>
            <div style="font-weight: 700; font-size: 15px; letter-spacing: -0.01em;">SmartMail AI – Response Assistant</div>
            <div style="font-size: 11px; color: #94a3b8;">Google Gemini Context-Aware Generation</div>
          </div>
        </div>
        <button id="sm-modal-close" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 4px;">&times;</button>
      </div>

      <div style="padding: 20px 24px; max-height: 75vh; overflow-y: auto;">
        ${
          !config.token
            ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px;">
            <strong>Authentication Required:</strong> Please click the SmartMail AI extension icon in your Chrome toolbar to log in, or paste your JWT token below.
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <input id="sm-manual-token" placeholder="Paste Bearer JWT Token" style="flex: 1; padding: 6px 10px; border: 1px solid #fca5a5; border-radius: 6px; font-size: 12px;" />
              <button id="sm-save-token-btn" style="background: #4f46e5; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Save Token</button>
            </div>
          </div>
        `
            : ''
        }

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Detected Email Context:</label>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 12px; color: #64748b; max-height: 90px; overflow-y: auto; white-space: pre-wrap;">${escapeHtml(
            config.emailText.slice(0, 400)
          )}${config.emailText.length > 400 ? '...' : ''}</div>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 14px;">
          <div style="flex: 1;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Tone:</label>
            <select id="sm-tone-select" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #fff;">
              <option value="Professional" ${config.defaultTone === 'Professional' ? 'selected' : ''}>Professional</option>
              <option value="Formal" ${config.defaultTone === 'Formal' ? 'selected' : ''}>Formal</option>
              <option value="Friendly" ${config.defaultTone === 'Friendly' ? 'selected' : ''}>Friendly</option>
              <option value="Casual" ${config.defaultTone === 'Casual' ? 'selected' : ''}>Casual</option>
              <option value="Apologetic" ${config.defaultTone === 'Apologetic' ? 'selected' : ''}>Apologetic</option>
              <option value="Persuasive" ${config.defaultTone === 'Persuasive' ? 'selected' : ''}>Persuasive</option>
            </select>
          </div>
          <div style="flex: 1;">
            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Length:</label>
            <select id="sm-length-select" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #fff;">
              <option value="Short" ${config.defaultLength === 'Short' ? 'selected' : ''}>Short (1-2 Paras)</option>
              <option value="Medium" ${config.defaultLength === 'Medium' ? 'selected' : ''}>Medium (Balanced)</option>
              <option value="Detailed" ${config.defaultLength === 'Detailed' ? 'selected' : ''}>Detailed</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Custom Instructions (Optional):</label>
          <input id="sm-instructions" placeholder="e.g. Confirm attendance for Friday, request agenda" style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px;" />
        </div>

        <button id="sm-generate-btn" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);">
          <span>Generate Context-Aware Reply</span>
        </button>

        <div id="sm-loading-indicator" style="display: none; text-align: center; padding: 20px 0;">
          <div style="display: inline-block; width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: smartmailSpin 0.8s linear infinite;"></div>
          <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Consulting Gemini AI via Spring Boot backend...</div>
        </div>

        <div id="sm-error-box" style="display: none; margin-top: 14px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 12px;"></div>

        <div id="sm-result-container" style="display: none; margin-top: 16px;">
          <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Generated Reply (Editable):</label>
          <textarea id="sm-reply-textarea" rows="8" style="width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; line-height: 1.5; font-family: inherit; resize: vertical;"></textarea>

          <div style="display: flex; gap: 10px; margin-top: 12px;">
            <button id="sm-insert-btn" style="flex: 2; padding: 10px 14px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
              ✔ Insert into Gmail Compose
            </button>
            <button id="sm-copy-btn" style="flex: 1; padding: 10px 14px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
              📋 Copy
            </button>
            <button id="sm-regen-btn" style="padding: 10px 14px; background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Style animation
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes smartmailSpin { to { transform: rotate(360deg); } }
      @keyframes smartmailFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    `;
    document.head.appendChild(styleTag);

    // Event Listeners
    const closeBtn = card.querySelector('#sm-modal-close');
    closeBtn.onclick = () => overlay.remove();

    const saveTokenBtn = card.querySelector('#sm-save-token-btn');
    if (saveTokenBtn) {
      saveTokenBtn.onclick = () => {
        const val = card.querySelector('#sm-manual-token').value.trim();
        if (val) {
          chrome.storage.local.set({ token: val }, () => {
            alert('Token saved! You can now generate replies.');
            config.token = val;
            const authBanner = card.querySelector('div[style*="background: #fef2f2"]');
            if (authBanner) authBanner.remove();
          });
        }
      };
    }

    const generateBtn = card.querySelector('#sm-generate-btn');
    const loadingInd = card.querySelector('#sm-loading-indicator');
    const errorBox = card.querySelector('#sm-error-box');
    const resultContainer = card.querySelector('#sm-result-container');
    const replyTextarea = card.querySelector('#sm-reply-textarea');
    const insertBtn = card.querySelector('#sm-insert-btn');
    const copyBtn = card.querySelector('#sm-copy-btn');
    const regenBtn = card.querySelector('#sm-regen-btn');

    const triggerGeneration = async () => {
      errorBox.style.display = 'none';
      resultContainer.style.display = 'none';
      loadingInd.style.display = 'block';
      generateBtn.disabled = true;

      const currentTone = card.querySelector('#sm-tone-select').value;
      const currentLength = card.querySelector('#sm-length-select').value;
      const currentInstructions = card.querySelector('#sm-instructions').value;

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'GENERATE_REPLY',
          payload: {
            originalContent: config.emailText,
            tone: currentTone,
            length: currentLength,
            additionalInstructions: currentInstructions || undefined,
            saveToHistory: true,
          },
          token: config.token,
        });

        if (!response.success) {
          throw new Error(response.error);
        }

        const reply = response.data.generatedReply;
        replyTextarea.value = reply;
        resultContainer.style.display = 'block';
      } catch (err) {
        errorBox.textContent = `Error: ${err.message}`;
        errorBox.style.display = 'block';
      } finally {
        loadingInd.style.display = 'none';
        generateBtn.disabled = false;
      }
    };

    generateBtn.onclick = triggerGeneration;
    regenBtn.onclick = triggerGeneration;

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(replyTextarea.value);
      copyBtn.textContent = '✔ Copied!';
      setTimeout(() => (copyBtn.textContent = '📋 Copy'), 2000);
    };

    insertBtn.onclick = () => {
      const reply = replyTextarea.value;
      insertReplyIntoGmail(reply);
      overlay.remove();
    };
  }

  /**
   * Inserts text into Gmail's active compose box without triggering auto-send.
   */
  function insertReplyIntoGmail(replyText) {
    // Locate the active contenteditable message box in Gmail
    const composeBox = document.querySelector(
      'div[role="textbox"][aria-label*="Message Body"], div[role="textbox"][aria-label*="Message body"], div[aria-label*="Message Body"], .Am.Al.editable'
    );

    if (composeBox) {
      composeBox.focus();
      // Use document.execCommand for rich-text undoable insertion
      const success = document.execCommand('insertText', false, replyText);
      if (!success) {
        // Fallback
        composeBox.innerHTML += replyText.replace(/\n/g, '<br>');
      }
      composeBox.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('[SmartMail AI] Reply successfully inserted into compose window.');
    } else {
      // If compose box is not currently open, click native reply button first
      const nativeReplyBtn = document.querySelector('[role="button"][data-tooltip*="Reply"], .T-I-ax7');
      if (nativeReplyBtn) {
        nativeReplyBtn.click();
        setTimeout(() => {
          insertReplyIntoGmail(replyText);
        }, 600);
      } else {
        alert(
          '[SmartMail AI] Please open the Gmail compose or reply window first, or copy the text using the Copy button.'
        );
      }
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
