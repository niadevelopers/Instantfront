(function enforceRealProfilePicture() {

  const DEFAULT_SRC_ENDS_WITH     = "default.png";
  const DEFAULT_SRC_PARTIAL       = "/assets/images/default.png";
  const INITIAL_DELAY_MS          = 20_000;    
  const RECHECK_EVERY_MS          = 25_000;   
  const OWN_AVATAR_SELECTORS      = [
    '#userProfileImage',               
    '#current-user-avatar img',        
  ];

  function isDefaultImage(img) {
    if (!img || !img.src) return false; 
    const src = img.src.toLowerCase();
    return src.endsWith(DEFAULT_SRC_ENDS_WITH) ||
           src.includes(DEFAULT_SRC_PARTIAL);
  }

  function hasDefaultOwnAvatar() {
    for (const sel of OWN_AVATAR_SELECTORS) {
      const img = document.querySelector(sel);
      if (img && isDefaultImage(img)) {
        return true;
      }
    }
    return false;
  }

  function shouldBlock() {
    return hasDefaultOwnAvatar();
  }

  let overlay = null;

  function createOrGetOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'force-profile-upload-overlay';
    overlay.innerHTML = `
      <div class="enforce-backdrop"></div>
      <div class="enforce-modal">
        <h2>One more step!</h2>
        <p>To start matching and chatting, please upload a real profile picture.</p>
        <button id="enforce-go-to-edit">Upload Photo Now</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const btn = overlay.querySelector('#enforce-go-to-edit');
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof renderProfileEdit === 'function') {
          overlay.style.display = 'none'; 
          renderProfileEdit();     
        } else {
          console.warn('[enforce-profile] renderProfileEdit() not found - check script load order');
        }
      });
    }

    return overlay;
  }

  function showBlocker() {
    const ov = createOrGetOverlay();
    if (ov.style.display !== 'flex') { 
      ov.style.display = 'flex';
      document.body.classList.add('enforce-no-scroll');
    }
  }

  function hideBlocker() {
    if (overlay && overlay.style.display !== 'none') {
      overlay.style.display = 'none';
      document.body.classList.remove('enforce-no-scroll');
    }
  }

  function checkAndEnforce() {
    if (shouldBlock()) {
      showBlocker();
    } else {
      hideBlocker();
    }
  }

  setTimeout(checkAndEnforce, INITIAL_DELAY_MS);

  setInterval(checkAndEnforce, RECHECK_EVERY_MS);

  setTimeout(checkAndEnforce, 2000);

  const observer = new MutationObserver(checkAndEnforce);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true });

})();

const style = document.createElement('style');
style.textContent = `
  #force-profile-upload-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    display: none;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s ease;
    opacity: 0;
  }

  #force-profile-upload-overlay[style*="display: flex"] {
    opacity: 1;
  }

  #force-profile-upload-overlay .enforce-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: opacity 0.3s ease;
  }

  #force-profile-upload-overlay .enforce-modal {
    position: relative;
    background: rgba(20, 20, 35, 0.94);
    color: white;
    padding: 2.4rem 2rem;
    border-radius: 16px;
    text-align: center;
    max-width: 380px;
    box-shadow: 0 20px 60px -12px rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.08);
    transform: scale(0.95);
    transition: transform 0.3s ease, opacity 0.3s ease;
    opacity: 0;
  }

  #force-profile-upload-overlay[style*="display: flex"] .enforce-modal {
    transform: scale(1);
    opacity: 1;
  }

  .enforce-modal h2 { margin: 0 0 1.1rem; font-size: 1.65rem; }
  .enforce-modal p   { margin: 0 0 1.8rem; font-size: 1.05rem; opacity: 0.92; line-height: 1.45; }

  .enforce-modal button {
    background: #e94560;
    color: white;
    border: none;
    padding: 0.95rem 2.4rem;
    font-size: 1.08rem;
    font-weight: 600;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.18s;
  }

  .enforce-modal button:hover {
    background: #f0546f;
    transform: translateY(-1px);
  }

  body.enforce-no-scroll {
    overflow: hidden;
    height: 100vh;
  }
`;

document.head.appendChild(style);
