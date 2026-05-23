// ============================================
// smart-wake.js - Copy this entire file
// ============================================

const SmartWake = (() => {
  const BACKEND_URL = 'https://instantdating.onrender.com'; // CHANGE THIS TO YOUR URL
  const WAKE_ENDPOINT = '/wakeup';
  const CHECK_ENDPOINT = '/health-check';
  
  const LAST_WAKE_KEY = 'server_last_wake_time';
  const SERVER_STATUS_KEY = 'server_known_status';
  
  const WAKE_COOLDOWN = 10 * 60 * 1000; // 10 minutes
  const FAST_CHECK_TIMEOUT = 3000; // 3 seconds
  const STATUS_CHECK_INTERVAL = 3 * 60 * 1000; // 3 minutes
  
  let checkInterval = null;
  let pendingWake = false;
  let lastKnownStatus = null;
  
  async function quickHealthCheck() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FAST_CHECK_TIMEOUT);
      
      const response = await fetch(`${BACKEND_URL}${CHECK_ENDPOINT}`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'X-Quick-Check': 'true' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        lastKnownStatus = 'alive';
        localStorage.setItem(SERVER_STATUS_KEY, JSON.stringify({
          status: 'alive',
          timestamp: Date.now()
        }));
        sessionStorage.setItem(SERVER_STATUS_KEY, JSON.stringify({
          status: 'alive',
          timestamp: Date.now()
        }));
        return true;
      }
    } catch (error) {
      lastKnownStatus = 'dead';
      localStorage.setItem(SERVER_STATUS_KEY, JSON.stringify({
        status: 'dead',
        timestamp: Date.now()
      }));
      sessionStorage.setItem(SERVER_STATUS_KEY, JSON.stringify({
        status: 'dead',
        timestamp: Date.now()
      }));
      return false;
    }
    return false;
  }
  
  async function getServerStatus() {
    const stored = localStorage.getItem(SERVER_STATUS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const age = Date.now() - data.timestamp;
      
      if (age < 120000) {
        lastKnownStatus = data.status;
        return data.status === 'alive';
      }
    }
    
    return await quickHealthCheck();
  }
  
  async function wakeServer() {
    if (pendingWake) return false;
    
    pendingWake = true;
    
    try {
      console.log('[Wake] Waking server...');
      
      fetch(`${BACKEND_URL}${WAKE_ENDPOINT}`, {
        method: 'HEAD',
        cache: 'no-store',
        headers: { 
          'X-Wake-Attempt': 'true',
          'Connection': 'close'
        }
      }).catch(() => {});
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${BACKEND_URL}${WAKE_ENDPOINT}`, new Blob());
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let retries = 3;
      for (let i = 0; i < retries; i++) {
        const isAlive = await quickHealthCheck();
        if (isAlive) {
          console.log('[Wake] Server ready');
          pendingWake = false;
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      pendingWake = false;
      return false;
    } catch (error) {
      pendingWake = false;
      return false;
    }
  }
  
  async function ensureServerReady() {
    const isAlive = await getServerStatus();
    
    if (isAlive) return true;
    
    const lastWakeAttempt = localStorage.getItem(LAST_WAKE_KEY);
    if (lastWakeAttempt) {
      const timeSinceLastWake = Date.now() - parseInt(lastWakeAttempt);
      if (timeSinceLastWake < WAKE_COOLDOWN) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const recheck = await quickHealthCheck();
        if (recheck) return true;
      }
    }
    
    localStorage.setItem(LAST_WAKE_KEY, Date.now().toString());
    return await wakeServer();
  }
  
  function startPeriodicChecks() {
    if (checkInterval) clearInterval(checkInterval);
    
    checkInterval = setInterval(async () => {
      const isAlive = await quickHealthCheck();
      if (!isAlive && document.visibilityState === 'visible') {
        await ensureServerReady();
      }
    }, STATUS_CHECK_INTERVAL);
    
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await ensureServerReady();
      }
    });
  }
  
  function stopPeriodicChecks() {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }
  
  return {
    ensureServerReady,
    startPeriodicChecks,
    stopPeriodicChecks,
    quickHealthCheck
  };
})();

// Auto-start when script loads
if (typeof window !== 'undefined') {
  SmartWake.ensureServerReady().then(() => {
    SmartWake.startPeriodicChecks();
  });
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => SmartWake.ensureServerReady(), { timeout: 3000 });
  }
  
  window.SmartWake = SmartWake;
}
