
const app = document.getElementById("app");
const API_BASE = "https://instantdating.onrender.com/api";

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, options); // prepend API_BASE
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}


const PLANS = {
  Premium:   { amount: 1 },
  Legend: { amount: 2 },
  Elite: { amount: 3 }
};



let currentPage = 1;
let currentSearchParams = ""; 

const loginTemplate = document.getElementById("login-template")?.content;
const registerTemplate = document.getElementById("register-template")?.content;
const overlayTemplate = document.getElementById("overlay-template")?.content;
const paywallTemplate = document.getElementById("paywall-template")?.content;
const profileEditTemplate = document.getElementById("profile-edit-template")?.content;

let token = localStorage.getItem("authToken") || null;
let currentUser = null;

const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const closePreview = document.getElementById("closePreview");

function openImagePreview(src) {
  if (!imagePreview || !previewImg) return;
  previewImg.src = src;
  imagePreview.classList.add("active");
  imagePreview.style.display = "flex"; 
}

closePreview?.addEventListener("click", () => {
  if (imagePreview) {
    imagePreview.classList.remove("active");
    imagePreview.style.display = "none";
  }
});


const loader = document.createElement('div');
loader.id = 'global-loader';
loader.className = 'loader glass pinkish';
loader.innerHTML = '<div class="spinner advanced-spinner"></div>';

Object.assign(loader.style, {
  display: 'none',
  position: 'fixed',
  inset: '0',
  zIndex: '100000', 
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(8px)', 
  webkitBackdropFilter: 'blur(8px)'
});

document.body.appendChild(loader);

function showLoader() {
  loader.style.display = 'flex';
}

function hideLoader() {
  loader.style.display = 'none';
}

const alertModal = document.createElement('div');
alertModal.id = 'custom-alert';
alertModal.style.cssText = `
  display: none;
  position: fixed;
  inset: 0;
  z-index: 150000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);      
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

alertModal.innerHTML = `
  <div class="modal-content" style="
    background: white;
    padding: 25px;
    border-radius: 16px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    animation: modalPop 0.3s ease-out;
  ">
    <p id="alert-msg" style="color: #333; font-size: 1.1rem; margin-bottom: 20px; font-family: sans-serif;"></p>
    <button id="alert-ok" style="
      background: #ff4d94; 
      color: white; 
      border: none; 
      padding: 10px 30px; 
      border-radius: 8px; 
      cursor: pointer; 
      font-weight: bold;
      width: 100%;
    ">OK</button>
  </div>
`;
document.body.appendChild(alertModal);

function customAlert(msg) {
  document.getElementById('alert-msg').textContent = msg;
  alertModal.style.display = 'flex';
}

document.getElementById('alert-ok')?.addEventListener('click', () => {
  alertModal.style.display = 'none';
});


const promptModal = document.createElement('div');
promptModal.id = 'custom-prompt';
promptModal.style.cssText = `
  display: none;
  position: fixed;
  inset: 0;
  z-index: 150001;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

promptModal.innerHTML = `
  <div class="modal-content" style="
    background: white;
    padding: 25px;
    border-radius: 16px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  ">
    <p id="prompt-msg" style="color: #333; font-weight: bold; margin-bottom: 15px; font-family: sans-serif;"></p>
    <input id="prompt-input" type="text" style="
      width: 100%;
      padding: 12px;
      margin-bottom: 20px;
      border: 2px solid #eee;
      border-radius: 8px;
      box-sizing: border-box;
      outline: none;
    ">
    <div style="display: flex; gap: 10px;">
      <button id="prompt-cancel" style="flex: 1; background: #eee; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">Cancel</button>
      <button id="prompt-ok" style="flex: 1; background: #ff4d94; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">Submit</button>
    </div>
  </div>
`;
document.body.appendChild(promptModal);

let promptCallback = null;

function customPrompt(msg, callback) {
  document.getElementById('prompt-msg').textContent = msg;
  const input = document.getElementById('prompt-input');
  input.value = '';
  promptModal.style.display = 'flex';
  input.focus();
  promptCallback = callback;
}

document.getElementById('prompt-ok')?.addEventListener('click', () => {
  const value = document.getElementById('prompt-input').value;
  promptModal.style.display = 'none';
  if (promptCallback) promptCallback(value);
});

document.getElementById('prompt-cancel')?.addEventListener('click', () => {
  promptModal.style.display = 'none';
  if (promptCallback) promptCallback(null);
});


const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes modalPop {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

document.getElementById('prompt-ok')?.addEventListener('click', () => {
  const value = document.getElementById('prompt-input').value;
  promptModal.style.display = 'none';
  if (promptCallback) promptCallback(value);
});

document.getElementById('prompt-cancel')?.addEventListener('click', () => {
  promptModal.style.display = 'none';
  if (promptCallback) promptCallback(null);
});


async function apiFetch(path, options = {}) {
  options.headers = options.headers || {};
  if (token) options.headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

if (localStorage.getItem("currentUser")) {
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    localStorage.removeItem("currentUser");
  }
}

if (token && !currentUser) {
  showLoader();
  apiFetch("/users/me")
    .then(user => {
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      renderHome();
    })
    .catch(logout)
    .finally(hideLoader);
}

if (!token || !currentUser) renderLogin();
else renderHome();

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  renderLogin();
}


function renderLogin() {
  app.innerHTML = "";
  app.appendChild(loginTemplate.cloneNode(true));

  document.getElementById("to-register")?.addEventListener("click", renderRegister);
  document.getElementById("login-btn")?.addEventListener("click", async () => {
    const email = document.getElementById("login-email")?.value?.trim();
    const password = document.getElementById("login-password")?.value?.trim();
    if (!email || !password) return customAlert("Please fill in all fields");

    showLoader();
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      token = data.token;
      currentUser = data.user;
      localStorage.setItem("authToken", token);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      renderHome();
    } catch (err) {
      customAlert(err.message || "Login failed");
    } finally {
      hideLoader();
    }
  });
}

function renderRegister() {
  app.innerHTML = "";
  app.appendChild(registerTemplate.cloneNode(true));

  document.getElementById("to-login")?.addEventListener("click", renderLogin);
  document.getElementById("register-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      gender: document.getElementById("gender")?.value,
      whatsapp: document.getElementById("whatsapp")?.value?.trim(),
      email: document.getElementById("email")?.value?.trim(),
      password: document.getElementById("password")?.value,
      location: document.getElementById("location")?.value?.trim(),
      intentions: document.getElementById("intentions")?.value,
      age: document.getElementById("age")?.value
    };

    showLoader();
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      token = data.token;
      currentUser = data.user;
      localStorage.setItem("authToken", token);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      renderHome();
    } catch (err) {
      customAlert(err.message || "Registration failed");
    } finally {
      hideLoader();
    }
  });
}


async function refreshCurrentUser() {
  if (!currentUser?._id || !token) return currentUser;
  showLoader();
  try {
    const fresh = await apiFetch(`/users/${currentUser._id}`);
    currentUser = fresh;
    localStorage.setItem("currentUser", JSON.stringify(fresh));
    return fresh;
  } catch {
    return currentUser;
  } finally {
    hideLoader();
  }
}


function toggleUserSpace() {
  const drawer = document.getElementById("user-drawer");
  if (drawer) drawer.classList.toggle("open");
}


function renderHome() {
  let warningBannerHTML = '';
  if (Array.isArray(currentUser?.warnings) && currentUser.warnings.length > 0) {
    const latestWarning = currentUser.warnings[currentUser.warnings.length - 1];
    if (latestWarning.text && latestWarning.issuedAt) {
      const issuedDate = new Date(latestWarning.issuedAt);
      const msElapsed = new Date() - issuedDate;
      const msIn24Hours = 24 * 60 * 60 * 1000;
      if (msElapsed < msIn24Hours) {
        const hoursLeft = Math.ceil((msIn24Hours - msElapsed) / (1000 * 60 * 60));
        warningBannerHTML = `
          <div id="admin-warning-banner" class="glass-warning pinkish">
            Warning from Admin: "${latestWarning.text}"
            <div style="font-size: 0.8em; font-weight: normal; margin-top: 5px;">
              Expires in ${hoursLeft} hours.
            </div>
          </div>`;
      }
    }
  }

  const hasProfileImage = currentUser?.profileImage && !currentUser.profileImage.includes('default-profile.png');
  const hasGalleryImages = Array.isArray(currentUser?.gallery) && currentUser.gallery.length > 0;
  const showCompleteProfileBanner = !hasProfileImage && !hasGalleryImages;

  const galleryHTML = hasGalleryImages
    ? currentUser.gallery.map(url => {
        const cleanUrl = url.replace(/^http:/,'https://');
        return `<img src="${cleanUrl}" class="gallery-img" loading="lazy" onclick="openImagePreview('${cleanUrl}')">`;
      }).join("")
    : "<p>No gallery images uploaded yet.</p>";

 
  app.innerHTML = `
    <nav class="navbar glass pinkish">
      <div class="logo">IntentDating</div>
      <img id="profile-pic-trigger" src="${currentUser?.profileImage?.replace(/^http:/,'https://') || 'default.png'}" 
           class="profile-pic-nav">
    </nav>

    <div id="user-drawer" class="user-drawer glass pinkish">
      <span class="close-drawer" id="close-drawer-btn">×</span>
      <div class="drawer-content">
        <img src="${currentUser?.profileImage?.replace(/^http:/,'https://') || 'default-profile.png'}" class="drawer-avatar">
        <h3>${currentUser?.email?.split('@')[0] || 'User'}</h3>
        
        <div class="drawer-actions">
           <button id="edit-profile-btn">Edit Profile</button>
           <button id="logout-btn" style="background:#dc3545;">Logout</button>
        </div>

        <div class="drawer-gallery">
          <h4>Your Gallery</h4>
          <div id="profile-gallery" class="drawer-gallery-grid">${galleryHTML}</div>
        </div>
      </div>
    </div>

    <div class="content-body pinkish">
        ${warningBannerHTML}
        ${showCompleteProfileBanner ? `
          <div id="setup-banner" class="banner-sleek pinkish">
             Your profile is empty! Add a photo to attract 5x more matches.
            <button id="banner-edit-btn">Complete Setup</button>
        </div>
        ` : ''}

        <section id="search-section" class="glass pinkish">
          <select id="search-intention"><option value="">Search by intention</option>
<option value="I want a serious romantic connection">
I want a serious romantic connection
</option>

<option value="I am here to flirt and see where it leads">
I am here to flirt and see where it leads
</option>

<option value="I’m up for casual fun and no strings">
I’m up for casual fun and no strings
</option>

<option value="Looking for a friends-with-benefits arrangement">
Looking for a friends-with-benefits arrangement
</option>

<option value="Open to a hot one night stand">
Open to a hot one night stand
</option>

<option value="Into same-sex flings or connections">
Into same-sex flings or connections
</option>

<option value="Exploring my sexual side">
Exploring my sexual side
</option>

<option value="Curious and ready for adventure">
Curious and ready for adventure
</option>
          </select>

          <select id="search-location"><option value="">Select County</option>
            <option value="Baringo">Baringo</option>
  <option value="Bomet">Bomet</option>
  <option value="Bungoma">Bungoma</option>
  <option value="Busia">Busia</option>
  <option value="Elgeyo-Marakwet">Elgeyo-Marakwet</option>
  <option value="Embu">Embu</option>
  <option value="Garissa">Garissa</option>
  <option value="Homa Bay">Homa Bay</option>
  <option value="Isiolo">Isiolo</option>
  <option value="Kajiado">Kajiado</option>
  <option value="Kericho">Kericho</option>
  <option value="Kiambu">Kiambu</option>
  <option value="Kilifi">Kilifi</option>
  <option value="Kirinyaga">Kirinyaga</option>
  <option value="Kisii">Kisii</option>
  <option value="Kisumu">Kisumu</option>
  <option value="Kitui">Kitui</option>
  <option value="Kwale">Kwale</option>
  <option value="Laikipia">Laikipia</option>
  <option value="Lamu">Lamu</option>
  <option value="Machakos">Machakos</option>
  <option value="Makueni">Makueni</option>
  <option value="Mandera">Mandera</option>
  <option value="Marsabit">Marsabit</option>
  <option value="Meru">Meru</option>
  <option value="Migori">Migori</option>
  <option value="Mombasa">Mombasa</option>
  <option value="Murang’a">Murang’a</option>
  <option value="Nairobi">Nairobi</option>
  <option value="Nakuru">Nakuru</option>
  <option value="Nandi">Nandi</option>
  <option value="Narok">Narok</option>
  <option value="Nyamira">Nyamira</option>
  <option value="Nyandarua">Nyandarua</option>
  <option value="Nyeri">Nyeri</option>
  <option value="Samburu">Samburu</option>
  <option value="Siaya">Siaya</option>
  <option value="Taita-Taveta">Taita-Taveta</option>
  <option value="Tana River">Tana River</option>
  <option value="Tharaka-Nithi">Tharaka-Nithi</option>
  <option value="Trans-Nzoia">Trans-Nzoia</option>
  <option value="Turkana">Turkana</option>
  <option value="Uasin Gishu">Uasin Gishu</option>
  <option value="Vihiga">Vihiga</option>
  <option value="Wajir">Wajir</option>
          </select>

          <button id="search-btn">Search</button>
        </section>

        <section id="cards-container"></section>
    </div>
  `;

  document.getElementById("profile-pic-trigger")?.addEventListener("click", toggleUserSpace);
  document.getElementById("close-drawer-btn")?.addEventListener("click", toggleUserSpace);
  document.getElementById("search-btn")?.addEventListener("click", searchUsers);
  document.getElementById("edit-profile-btn")?.addEventListener("click", renderProfileEdit);
  document.getElementById("banner-edit-btn")?.addEventListener("click", renderProfileEdit);
  document.getElementById("logout-btn")?.addEventListener("click", logout);

  fetchUsers();
}


function renderCards(users) {
  const container = document.getElementById("cards-container");
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(users) || !users.length) {
    container.innerHTML = `<div class="no-results glass pinkish"><h3>No users found</h3></div>`;
    return;
  }

  users.forEach(user => {
    const card = document.createElement("div");
    card.className = "card glass pinkish user-card";
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${user.profileImage?.replace(/^http:/,'https://') || 'assets/images/default.png'}" loading="lazy" alt="${user.name || 'User'}">
        

     <span class="card-tier-tag ${user.tier?.toLowerCase() || 'unknown'}">
  ${user.tier ? user.tier.toUpperCase() : ''}
</span>


      </div>
      <div class="card-info">
        <!-- This is the line that was wrong -->
        <h3>${user.email?.split('@')[0] || user.name || 'User'}</h3>
        
        <!-- Better alternatives (uncomment one): -->
        <!-- <h3>${user.name || user.username || user.email?.split('@')[0] || 'User'}</h3> -->
        <!-- <h3>${user.displayName || user.name || 'No name'}</h3> -->

        <p>${user.intentions || '?'}</p>

       <p style="
  color:#ff4d8d;
  font-weight:600;
  font-family:'Poppins','Segoe UI',sans-serif;
  letter-spacing:0.5px;
  font-size:14px;
  
  align-items:center;
  gap:6px;
">
  <svg xmlns="http://www.w3.org/2000/svg"
       width="16"
       height="16"
       fill="#ff4d8d"
       viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 
             7-13c0-3.87-3.13-7-7-7zm0 
             9.5A2.5 2.5 0 1 1 12 6a2.5 
             2.5 0 0 1 0 5.5z"/>
  </svg>

  ${user.location || '?'}
</p>

        <button onclick="showOverlay('${user._id}')">View Profile</button>
      </div>
    `;
    container.appendChild(card);
  });
}


async function fetchUsers(page = 1) {
  showLoader();
  try { 
    const queryConnector = currentSearchParams ? `&` : `?`;
    const url = `/users/search${currentSearchParams}${queryConnector}page=${page}`;
    
    const data = await apiFetch(url); 
    
    renderCards(data.users); 
    renderPagination(data.totalPages, data.currentPage);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  catch (err) { 
    console.error(err); 
    customAlert("Failed to load users. Please check your connection.");
  }
  finally { hideLoader(); }
}



function renderPagination(totalPages, current) {
  if (!document.getElementById("pagination-styles")) {
    const style = document.createElement("style");
    style.id = "pagination-styles";
    style.innerHTML = `
      .pagination-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        /* Increased bottom margin to stay above the 4 fixed buttons */
        margin: 40px 0 100px 0; 
        padding: 15px;
        position: relative;
        z-index: 10;
      }
      .page-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.15);
        color: #fff; /* White text looks better on glass */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .page-btn.active {
        background: #ff4d94;
        color: white;
        border: none;
        box-shadow: 0 0 20px rgba(255, 77, 148, 0.8);
        transform: translateY(-5px) scale(1.1); /* Lifts the active ball up slightly */
      }
      .page-dots {
        color: rgba(255, 255, 255, 0.6);
        font-weight: bold;
        letter-spacing: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  const existingNav = document.getElementById("pagination-nav");
  if (existingNav) existingNav.remove();

  if (totalPages <= 1) return;

  const nav = document.createElement("div");
  nav.id = "pagination-nav";
  nav.className = "pagination-wrapper";

  let buttonsHTML = "";
  const range = 1; 

  buttonsHTML += `<button class="page-btn ${current === 1 ? 'active' : ''}" onclick="fetchUsers(1)">1</button>`;

  if (current > range + 2) {
    buttonsHTML += `<span class="page-dots">...</span>`;
  }

  for (let i = Math.max(2, current - range); i <= Math.min(totalPages - 1, current + range); i++) {
    buttonsHTML += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="fetchUsers(${i})">${i}</button>`;
  }

  if (current < totalPages - range - 1) {
    buttonsHTML += `<span class="page-dots">...</span>`;
  }

  if (totalPages > 1) {
    buttonsHTML += `<button class="page-btn ${current === totalPages ? 'active' : ''}" onclick="fetchUsers(${totalPages})">${totalPages}</button>`;
  }

  nav.innerHTML = buttonsHTML;
  
  document.getElementById("cards-container").after(nav);
}

async function searchUsers() {
  const intention = document.getElementById("search-intention")?.value?.trim();
  const location  = document.getElementById("search-location")?.value?.trim();

  const filled = [
    intention ? "intention" : null, 
    location ? "location" : null
  ].filter(Boolean);

  if (!filled.length) {
    currentSearchParams = "";
  } else if (filled.length > 1) {
    return customAlert(`Only one field at a time. Filled: ${filled.join(", ")}`);
  } else {
    const params = new URLSearchParams();
    if(intention) params.append("intentions", intention);
    if(location) params.append("location", location);
    currentSearchParams = `?${params.toString()}`;
  }

  fetchUsers(1);
}


if(overlayTemplate) document.body.appendChild(overlayTemplate.cloneNode(true));
const overlay = document.getElementById("overlay");
if (overlay) {
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '90000';
}
const closeOverlay = document.getElementById("close-overlay");
closeOverlay?.addEventListener("click", ()=>overlay?.classList.remove("active"));

async function showOverlay(userId) {
  const overlayContainer = document.getElementById("overlay");
  if (!overlayContainer) {
    console.error("Overlay element not found in DOM");
    return;
  }

  showLoader();
  try {
    const data = await apiFetch(`/users/${userId}`);
    
    overlayContainer.classList.add("active");

    const profImg = document.getElementById("overlay-profile-img");
    if (profImg) {
      profImg.src = data.profileImage?.replace(/^http:/, 'https://') || "assets/images/default.png";
      profImg.onclick = () => openImagePreview(profImg.src);
    }

    const nameEl = document.getElementById("overlay-name");
    if (nameEl) {
      const tier = (data.tier || 'Premium').trim();
      const tierLower = tier.toLowerCase();

      let bgGradient, textColor, borderColor, shadowColor;

      if (tierLower === 'premium') {
        bgGradient = 'linear-gradient(135deg, #d0d0d0, #b0b0b0)';
        textColor = '#444';
        borderColor = '#999';
        shadowColor = 'rgba(0,0,0,0.15)';
      } else if (tierLower === 'legend') {
        bgGradient = 'linear-gradient(135deg, #f1c40f, #d4af37)';
        textColor = '#1a1a1a';
        borderColor = '#b8860b';
        shadowColor = 'rgba(212,175,55,0.4)';
      } else if (tierLower === 'elite') {
        bgGradient = 'linear-gradient(135deg, #a569bd, #8e44ad)';
        textColor = 'white';
        borderColor = '#6c3483';
        shadowColor = 'rgba(142,68,173,0.5)';
      } else {
        bgGradient = '#e0e0e0';
        textColor = '#555';
        borderColor = '#aaa';
        shadowColor = 'rgba(0,0,0,0.1)';
      }

      nameEl.innerHTML = `
        ${data.intentions || 'No intention'} 
        <span style="
          position: relative;
          display: inline-block;
          margin-left: 8px;
          padding: 4px 16px 5px 20px;
          font-size: 0.82rem;
          font-weight: 700;
          font-family: Georgia, 'Times New Roman', serif;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          color: ${textColor};
          background: ${bgGradient};
          border: 1px solid ${borderColor};
          border-radius: 6px 14px 14px 6px;
          box-shadow: 
            0 2px 6px ${shadowColor},
            inset 0 1px 1px rgba(255,255,255,0.3);
          transform: rotate(-5deg);
          transform-origin: top right;
          white-space: nowrap;
          vertical-align: middle;
          z-index: 1;
        ">
          <!-- fake pin/staple head -->
          <span style="
            position: absolute;
            top: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 10px;
            background: #444;
            border-radius: 50%;
            box-shadow: 
              inset 0 1px 3px #222,
              0 1px 4px rgba(0,0,0,0.45);
            z-index: -1;
          "></span>
          ${tier.toUpperCase()}
        </span>
      `;
    }

    const locEl = document.getElementById("overlay-location");
if (locEl) {
  const locationText = data.location || "Unknown";
  locEl.innerHTML = `
    <span style="
      color: #ff6f91;              /* --primary-pink from your CSS */
      font-weight: 700;            /* bold */
      font-size: 1.05rem;          /* slightly larger for emphasis (optional) */
      letter-spacing: 0.3px;
    ">
      Location: ${locationText}
    </span>
  `;
}

    const galleryEl = document.getElementById("overlay-gallery");
    if (galleryEl) {
      galleryEl.innerHTML = "";
      (data.gallery || []).forEach(url => {
        const img = document.createElement("img");
        const cleanUrl = url.replace(/^http:/, 'https://');
        img.src = cleanUrl;
        img.className = "gallery-img";
        img.loading = "lazy";
        img.onclick = () => openImagePreview(cleanUrl);
        galleryEl.appendChild(img);
      });
    }

    const waBtn = document.getElementById("overlay-whatsapp-btn");
    if (waBtn) {
      waBtn.onclick = () => unlockContact(userId);
    }

    const reportBtn = document.getElementById("reportUserBtn");
    if (reportBtn) {
      reportBtn.onclick = async () => {
        const lastReport = currentUser?.lastReportTime ? new Date(currentUser.lastReportTime) : null;
        const now = new Date();
        
        if (lastReport && (now - lastReport) < (24 * 60 * 60 * 1000)) {
          const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (now - lastReport)) / (1000 * 60 * 60));
          return customAlert(`You can only report one user every 24 hours. Please wait ${hoursLeft} more hours.`);
        }

        customPrompt("Why are you reporting this user?", async (reason) => {
          if (!reason?.trim()) return;

          showLoader();
          try {
            await apiFetch("/reports/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reportedId: userId, reason: reason.trim() })
            });
            
            currentUser.lastReportTime = new Date().toISOString();
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            customAlert("Report submitted successfully!");
          } catch (err) { 
            customAlert(err.message); 
          } finally {
            hideLoader();
          }
        });
      };
    }
  } catch (err) { 
    console.error(err);
    customAlert("Could not load profile. Please check your connection."); 
  } finally {
    hideLoader();
  }
}


async function unlockContact(userId){
  showLoader();
  try{
    const data = await apiFetch("/users/unlock-contact", {
      method:"POST", 
      headers:{"Content-Type":"application/json"}, 
      body:JSON.stringify({targetUserId:userId})
    });

    let phone = data.whatsapp?.trim() || '';
    phone = phone.replace(/\D/g, ''); 

    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    } else if (!phone.startsWith('254') && phone.length === 9) {
      phone = '254' + phone;
    }

    if (!phone || phone.length < 10) {
      throw new Error("Invalid WhatsApp number format");
    }

    const currentUserName = currentUser?.email?.split('@')[0] || 'someone';

    const formattedName = currentUserName.charAt(0).toUpperCase() + currentUserName.slice(1);

    const websiteUrl = "https://instantfront.vercel.app/";


const messageText = 
  `Hi, I'm *${formattedName}!* I saw you on IntentDating \n` +
  `${websiteUrl}\n\n` +
  `I saw your intentions in the app — that's exactly what I'm hoping to find too\n` +
  `Would love to chat and see if we vibe…`;

    const encodedMessage = encodeURIComponent(messageText);

    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

  } catch(err){ 
    console.error("Unlock contact failed:", err);
    promptPaywall(); 
  } finally { 
    hideLoader(); 
  }
}


if(paywallTemplate) document.body.appendChild(paywallTemplate.cloneNode(true));
const paywallOverlay = document.getElementById("paywall-overlay");
if (paywallOverlay) {
  paywallOverlay.style.position = 'fixed';
  paywallOverlay.style.inset = '0';
  paywallOverlay.style.zIndex = '80000'; 
}
document.getElementById("close-paywall")?.addEventListener("click", ()=>paywallOverlay?.classList.remove("active"));
function promptPaywall(){ 
  if (paywallOverlay) paywallOverlay.classList.add("active"); 
}


function renderProfileEdit(){
  if(!profileEditTemplate) return customAlert("Edit template not found");

  app.innerHTML = ""; 
  app.appendChild(profileEditTemplate.cloneNode(true));

  const MAX_GALLERY_IMAGES = 3;
  const PROFILE_COOLDOWN_DAYS = 3;

  document.getElementById("edit-whatsapp").value = currentUser?.whatsapp || "";
  document.getElementById("edit-email").value   = currentUser?.email   || "";
  document.getElementById("edit-age").value      = currentUser?.age      || "";
  document.getElementById("edit-intentions").value = currentUser?.intentions || "";

  const profileInput = document.getElementById("edit-profile-image");
  const galleryInput = document.getElementById("edit-gallery");

  if (currentUser?.lastProfileImageUpdated) {
    const daysPassed = (new Date() - new Date(currentUser.lastProfileImageUpdated)) / (1000 * 60 * 60 * 24);
    if (daysPassed < PROFILE_COOLDOWN_DAYS) {
      profileInput.disabled = true;
      const small = document.createElement("small");
      small.style.color = "#ffc107";
      small.innerText = ` Cooldown active: ${Math.ceil(PROFILE_COOLDOWN_DAYS - daysPassed)} days left.`;
      profileInput.after(small);
    }
  }

  const currentCount = currentUser?.gallery?.length || 0;
  if (currentCount >= MAX_GALLERY_IMAGES) {
    galleryInput.disabled = true;
    const small = document.createElement("small");
    small.style.color = "#dc3545";
    small.innerText = ` Gallery limit of ${MAX_GALLERY_IMAGES} images reached.`;
    galleryInput.after(small);
  }

  document.getElementById("profile-edit-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    showLoader();
    try {
      const profileFile = profileInput.files?.[0];
      if (profileFile && !profileInput.disabled) {
        const fd = new FormData(); 
        fd.append("image", profileFile);
        const pdata = await apiFetch("/users/upload/profile", { method: "POST", body: fd });
        if (pdata.image) currentUser.profileImage = pdata.image.replace(/^http:/, 'https://');
        currentUser.lastProfileImageUpdated = new Date().toISOString();
      }

      const galleryFiles = galleryInput.files;
      if (galleryFiles?.length > 0 && !galleryInput.disabled) {
        const available = MAX_GALLERY_IMAGES - currentCount;
        if (galleryFiles.length > available) {
          return customAlert(`You can only add ${available} more images.`);
        }

        const fd = new FormData();
        for (const f of galleryFiles) fd.append("image", f);
        const gdata = await apiFetch("/users/upload/gallery", { method: "POST", body: fd });
        if (gdata.images?.length) {
          currentUser.gallery = [...(currentUser.gallery || []), ...gdata.images.map(u => u.replace(/^http:/, 'https://'))];
        }
      }

      const body = {
        whatsapp:   document.getElementById("edit-whatsapp").value.trim(),
        email:      document.getElementById("edit-email").value.trim(),
        age:        document.getElementById("edit-age").value.trim(),
        intentions: document.getElementById("edit-intentions").value.trim()
      };
      if (Object.values(body).some(value => value === "")) {
        return customAlert("All fields are required. Please fill in everything.");
      }
      await apiFetch("/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      await refreshCurrentUser();
      customAlert("Profile updated successfully!");
      renderHome();

    } catch (err) {
      customAlert(err.message || "Update failed");
    } finally {
      hideLoader();
    }
  });

  const backButton = document.createElement("button");
  backButton.textContent = "← Back to Home";
  backButton.type = "button";
  backButton.id = "edit-back-to-home";

  backButton.style.cssText = `
    display: block;
    width: 90%;
    max-width: 240px;
    margin: 24px auto 32px auto;
    padding: 12px 20px;
    font-size: 1.05rem;
    font-weight: 500;
    color: #ffffff;
    background:#fa577d40;
    border: 1px solid rgba(255, 255, 255, 0.30);
    border-radius: 12px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    transition: all 0.2s ease;
  `;

  backButton.onmouseover = () => {
    backButton.style.background = "rgba(255, 105, 180, 0.45)";
    backButton.style.transform = "translateY(-2px)";
    backButton.style.boxShadow = "0 8px 25px rgba(0,0,0,0.35)";
  };
  backButton.onmouseout = () => {
    backButton.style.background = "rgba(255, 105, 180, 0.25)";
    backButton.style.transform = "translateY(0)";
    backButton.style.boxShadow = "0 4px 15px rgba(0,0,0,0.25)";
  };
  backButton.onmousedown = () => {
    backButton.style.transform = "translateY(1px)";
  };
  const card = document.querySelector('.card.glass');
  if (card) {
    card.appendChild(backButton);
  } else {
    app.appendChild(backButton);
  }
  backButton.addEventListener("click", () => {
    renderHome();
  });
}


document.querySelectorAll("img").forEach(img=>img.loading="lazy");

const tooltip = document.getElementById('tooltip');
if (tooltip) {
  tooltip.style.zIndex = '95000'; 
}

document.querySelectorAll('.footer-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    const text = btn.dataset.tooltip;
    if(!tooltip) return;
    tooltip.textContent = text;
    const rect = btn.getBoundingClientRect();
    tooltip.style.top = rect.top - 40 + 'px';
    tooltip.style.left = rect.left + rect.width/2 - tooltip.offsetWidth/2 + 'px';
    tooltip.style.opacity = '1';
    tooltip.style.zIndex = "100001";
  });
  btn.addEventListener('mouseleave', () => { if(tooltip) tooltip.style.opacity = '0'; });
});

function openOverlayFoot(id){ 
  const o = document.getElementById(id);
  o.classList.add('active'); 
  o.style.zIndex = "99990";
}
function closeOverlayFoot(event){
  const overlay = event.target.closest('.floating-overlay');
  if(overlay) overlay.classList.remove('active');
}

document.querySelectorAll('.floating-overlay .close-overlay').forEach(btn => btn.addEventListener('click', closeOverlayFoot));
document.querySelector('.gratitude-btn')?.addEventListener('click', () => openOverlayFoot('gratitude-overlay'));
document.querySelector('.guide-btn')?.addEventListener('click', () => openOverlayFoot('guide-overlay'));
document.querySelector('.tips-btn')?.addEventListener('click', () => openOverlayFoot('tips-overlay'));
document.querySelector('.whatsapp-btn')?.addEventListener('click', () => {
  const phone = '254714063137';

  const username = currentUser?.email?.split('@')[0] || 'Visitor';

  const websiteUrl = window.location.href;

  const message = `Hello Admin, I am *${username}* reaching out from ${websiteUrl}`;

  const encodedMessage = encodeURIComponent(message);

  const url = `https://wa.me/${phone}?text=${encodedMessage}`;

  window.open(url, '_blank');
});



document.querySelectorAll('.overlay').forEach(overlay => {
  const slides = overlay.querySelectorAll('.slide');
  const nextBtn = overlay.querySelector('.next-btn');
  const prevBtn = overlay.querySelector('.prev-btn');
  const indicator = overlay.querySelector('.slide-indicator');
  
  if (!nextBtn || !prevBtn || slides.length === 0) {
    return; 
  }

  let currentIndex = 0;

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentIndex);
    });
    
    if (indicator) {
      indicator.innerText = `${currentIndex + 1} / ${slides.length}`;
    }
    
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === slides.length - 1;

    prevBtn.style.opacity = currentIndex === 0 ? "0.3" : "1";
    nextBtn.style.opacity = currentIndex === slides.length - 1 ? "0.3" : "1";
  }

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updateSlides();
    }
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      currentIndex--;
      updateSlides();
    }
  });

  updateSlides();
});


function initPaywallButtons() {
  const payButtons = document.querySelectorAll("#paywall-overlay .pay-btn");

  payButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const planCard = btn.closest(".plan-card");
      const plan = planCard?.dataset.plan;

      if (!plan || !PLANS?.[plan]) {
        return customAlert("Invalid plan selected");
      }

      //Always prompt for M-Pesa number
      const phone = await new Promise(resolve => {
        customPrompt(
          "Enter the M-Pesa phone number to pay with (07..., 01..., 254..., or +254...)",
          value => {
            if (!value) return resolve(null);

            let cleaned = value
              .trim()
              .replace(/\s/g, "")  
              .replace(/^\+/, "");  

            // converts local format → 254XXXXXXXXX
            if (cleaned.startsWith("0")) {
              cleaned = "254" + cleaned.slice(1);
            }

            resolve(cleaned);
          }
        );
      });

      // Validate Kenyan Safaricom numbers
      if (!phone || !/^254[17]\d{8}$/.test(phone)) {
        return customAlert(
          "Please enter a valid Kenyan phone number (07..., 01..., 254..., or +254...)"
        );
      }

      showLoader();

      try {
        const response = await apiFetch("/payments/stk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, phone })
        });

        if (response.msg?.includes("STK")) {
          customAlert(
            "M-Pesa prompt sent! Check your phone and enter your PIN to complete the payment."
          );

          startPolling(response.paymentId, plan);
        } else {
          customAlert(response.msg || "Unexpected response from server.");
        }
      } catch (err) {
        customAlert(
          err.message || "Failed to initiate payment. Please try again."
        );
      } finally {
        hideLoader();
      }
    });
  });
}

let pollingInterval = null;

function startPolling(paymentId, plan) {
  if (pollingInterval) clearInterval(pollingInterval);

  const maxAttempts = 36;    
  let attempts = 0;

  pollingInterval = setInterval(async () => {
    attempts++;
    try {
      const data = await apiFetch(`/payments/status/${paymentId}`);

      if (data.status === "completed") {
        clearInterval(pollingInterval);
        pollingInterval = null;

        customAlert(`Payment successful! Your ${plan} plan is now active. Enjoy!`);
        paywallOverlay?.classList.remove("active");

        await refreshCurrentUser();

        
      } 
      else if (data.status === "failed" || attempts >= maxAttempts) {
        clearInterval(pollingInterval);
        pollingInterval = null;
        customAlert(
          attempts >= maxAttempts
            ? "Payment timed out. Please try again if funds weren't deducted."
            : "Payment failed or was cancelled. Try again?"
        );
      }

    } catch (err) {
      console.error("Polling error:", err);
      
      if (attempts > 5) {
        clearInterval(pollingInterval);
        customAlert("Unable to check payment status right now. Please refresh the page.");
      }
    }
  }, 5000); 
}

if (paywallOverlay) {
  initPaywallButtons();

}

document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('login-password');
  const toggleBtn     = document.getElementById('toggle-password-btn');
  
  if (!passwordInput || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    
    passwordInput.type = isPassword ? 'text' : 'password';
    
    toggleBtn.querySelector('i').classList.toggle('fa-eye');
    toggleBtn.querySelector('i').classList.toggle('fa-eye-slash');
    
    toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    toggleBtn.title = isPassword ? 'Hide password' : 'Show password';
  });
});

let deferredPrompt = null;
let bannerVisible = false;


function isInstalledPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    ('standalone' in navigator && navigator.standalone === true)
  );
}


function showInstallBanner() {
  if (!deferredPrompt) return;
  if (bannerVisible) return;
  if (isInstalledPWA()) return;

  if (localStorage.getItem('pwa_install_dismissed') === 'true') {
    return;
  }

  bannerVisible = true;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';

  banner.innerHTML = `
    <div class="install-banner-content">
      <div class="banner-text">
        <strong>Add IntentDating to your home screen</strong><br>
        <span>Faster access & offline support</span>
      </div>

      <div class="banner-actions">
        <button id="install-btn" class="install-btn">
          Install
        </button>

        <button id="close-banner-btn"
                class="close-btn"
                aria-label="Close">
          ×
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  requestAnimationFrame(() => {
    banner.classList.add('visible');
  });

  document
    .getElementById('install-btn')
    .addEventListener('click', async () => {

      if (!deferredPrompt) return;

      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        console.log('User installed PWA');
        localStorage.setItem('pwa_install_dismissed', 'true');
        hideInstallBanner();
      } else {
        console.log('User dismissed install');
      }
    });

  document
    .getElementById('close-banner-btn')
    .addEventListener('click', () => {

      localStorage.setItem('pwa_install_dismissed', 'true');
      hideInstallBanner();
    });
}


function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');

  if (!banner) return;

  banner.classList.remove('visible');

  setTimeout(() => {
    banner.remove();
    bannerVisible = false;
  }, 300);
}

window.addEventListener('beforeinstallprompt', (event) => {
  console.log('beforeinstallprompt fired');

  if (isInstalledPWA()) return;

  event.preventDefault();

  deferredPrompt = event;

  showInstallBanner();
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully');

  deferredPrompt = null;
  hideInstallBanner();

  localStorage.setItem('pwa_install_dismissed', 'true');
});

document.addEventListener('visibilitychange', () => {
  if (
    document.visibilityState === 'visible' &&
    deferredPrompt &&
    !isInstalledPWA()
  ) {
    showInstallBanner();
  }

});





