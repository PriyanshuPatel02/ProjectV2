// // ============================================================
// // APP.JS — Utilities, Navigation, Toast, Modal helpers
// // ============================================================

// // ── Toast notifications ────────────────────────────────────
// function toast(msg, type = 'info') {
//   let container = document.getElementById('toast-container');
//   if (!container) {
//     container = document.createElement('div');
//     container.id = 'toast-container';
//     document.body.appendChild(container);
//   }
//   const icons = { success:'✅', error:'❌', info:'ℹ️' };
//   const el = document.createElement('div');
//   el.className = `toast ${type}`;
//   el.innerHTML = `<span>${icons[type]||'💬'}</span><span>${msg}</span>`;
//   container.appendChild(el);
//   el.onclick = () => el.remove();
//   setTimeout(() => el.remove(), 4000);
// }

// // ── Modal helpers ─────────────────────────────────────────
// function openModal(html) {
//   const overlay = document.createElement('div');
//   overlay.className = 'modal-overlay';
//   overlay.id = 'global-modal';
//   overlay.innerHTML = `<div class="modal">${html}</div>`;
//   document.body.appendChild(overlay);
//   overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
// }
// function closeModal() {
//   const m = document.getElementById('global-modal');
//   if(m) m.remove();
// }

// // ── Confirm dialog ────────────────────────────────────────
// function confirm(msg) {
//   return new Promise(resolve => {
//     openModal(`
//       <div class="modal-header"><h3 class="modal-title">Confirm</h3><button class="modal-close" onclick="closeModal()">×</button></div>
//       <p style="color:var(--muted);margin-bottom:1.5rem">${msg}</p>
//       <div class="flex gap-2">
//         <button class="btn btn-danger" id="confirm-yes">Yes, Proceed</button>
//         <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
//       </div>
//     `);
//     setTimeout(() => {
//       document.getElementById('confirm-yes')?.addEventListener('click', () => { closeModal(); resolve(true); });
//     }, 50);
//   });
// }

// // ── Auth guard ────────────────────────────────────────────
// function requireCustomerAuth() {
//   const sess = Store.getSession();
//   if (!sess || sess.role !== 'customer') {
//     window.location.href = 'index.html';
//     return null;
//   }
//   return sess;
// }

// function requireAdminAuth() {
//   const sess = Store.getSession();
//   if (!sess || sess.role !== 'admin') {
//     window.location.href = 'admin-login.html';
//     return null;
//   }
//   return sess;
// }

// // ── Render customer navbar ────────────────────────────────
// function renderCustomerNav(activeLink = '') {
//   const sess = Store.getSession();
//   const cartCount = Store.getCart().length;
//   const nav = document.getElementById('main-nav');
//   if (!nav) return;
//   nav.innerHTML = `
//     <div class="brand">Shop<span>Xpress</span></div>
//     <ul class="nav-links">
//       <li><a href="home.html" class="${activeLink==='home'?'active':''}">🏠 Home</a></li>
//       <li><a href="cart.html" class="${activeLink==='cart'?'active':''}">🛒 My Cart <span class="cart-badge">${cartCount||0}</span></a></li>
//       <li><a href="orders.html" class="${activeLink==='orders'?'active':''}">📦 My Orders</a></li>
//     </ul>
//     <div class="nav-right">
//       <span class="nav-user">👤 ${sess?.name || ''}</span>
//       <a href="profile.html" class="btn btn-outline btn-sm">Profile</a>
//       <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
//     </div>
//   `;
// }

// function renderAdminNav(activeSection = '') {
//   const nav = document.getElementById('main-nav');
//   const sess = Store.getSession();
//   if (!nav) return;
//   nav.innerHTML = `
//     <div class="brand">Shop<span>Xpress</span> <span style="font-size:.7rem;color:var(--muted);font-family:var(--font-body)">Admin</span></div>
//     <div class="nav-right">
//       <span class="nav-user">🛠️ ${sess?.name || 'Admin'}</span>
//       <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
//     </div>
//   `;
// }

// function renderSiteFooter() {
//   const footer = document.getElementById('main-footer');
//   if (!footer) return;

//   footer.className = 'sx-footer';
//   footer.innerHTML = `
//     <div class="container sx-footer-inner">
//       <div class="sx-footer-grid">
//         <div>
//           <h4>Shop<span>Xpress</span></h4>
//           <p>Quality products, smooth checkout, and dependable delivery for your everyday shopping.</p>
//         </div>

//         <div>
//           <h5>Customer Care</h5>
//           <ul class="sx-footer-links">
//             <li><a href="home.html">Shop</a></li>
//             <li><a href="orders.html">Track Orders</a></li>
//             <li><a href="profile.html">Account Settings</a></li>
//           </ul>
//         </div>

//         <div>
//           <h5>Connect With Us</h5>
//           <p>support@shopxpress.com<br>+91 98765 43210</p>
//           <div class="sx-socials">
//             <a class="sx-social" href="#" aria-label="Facebook">f</a>
//             <a class="sx-social" href="#" aria-label="Instagram">ig</a>
//             <a class="sx-social" href="#" aria-label="X">x</a>
//             <a class="sx-social" href="#" aria-label="YouTube">yt</a>
//           </div>
//         </div>
//       </div>

//       <div class="sx-footer-bottom">
//         <p>© ${new Date().getFullYear()} ShopXpress. All rights reserved.</p>
//         <div class="sx-footer-mini">
//           <a href="#">Privacy</a>
//           <a href="#">Terms</a>
//         </div>
//       </div>
//     </div>
//   `;
// }

// function logout() {
//   const sess = Store.getSession();
//   Store.clearSession();
//   if (sess?.role === 'admin') {
//     window.location.href = 'admin-login.html';
//   } else {
//     window.location.href = 'index.html';
//   }
// }

// // ── Pagination helper ─────────────────────────────────────
// function paginate(items, page, perPage = 10) {
//   const total = Math.ceil(items.length / perPage);
//   const slice = items.slice((page - 1) * perPage, page * perPage);
//   return { items: slice, total, page };
// }

// function renderPagination(container, current, total, onPage) {
//   container.innerHTML = '';
//   if (total <= 1) return;
//   const prev = document.createElement('button');
//   prev.className = 'page-btn'; prev.textContent = '← Prev'; prev.disabled = current === 1;
//   prev.onclick = () => onPage(current - 1);
//   container.appendChild(prev);
//   for (let i = 1; i <= total; i++) {
//     const b = document.createElement('button');
//     b.className = 'page-btn' + (i === current ? ' active' : '');
//     b.textContent = i; b.onclick = () => onPage(i);
//     container.appendChild(b);
//   }
//   const next = document.createElement('button');
//   next.className = 'page-btn'; next.textContent = 'Next →'; next.disabled = current === total;
//   next.onclick = () => onPage(current + 1);
//   container.appendChild(next);
// }

// // ── Badge helper ──────────────────────────────────────────
// function statusBadge(status) {
//   const map = {
//     'Confirmed':  'badge-confirmed',
//     'Delivered':  'badge-delivered',
//     'In Transit': 'badge-transit',
//     'Cancelled':  'badge-cancelled',
//     'Active':     'badge-active',
//     'In Active':  'badge-inactive',
//   };
//   return `<span class="product-badge ${map[status]||''}">${status}</span>`;
// }

// // ── Format currency ───────────────────────────────────────
// function rupee(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

// // ── Date format ───────────────────────────────────────────
// function fmtDate(iso) {
//   if (!iso) return '—';
//   return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
// }


function toast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||'💬'}</span><span>${msg}</span>`;
  container.appendChild(el);
  el.onclick = () => el.remove();
  setTimeout(() => el.remove(), 4000);
}

// ── Modal helpers 
function openModal(html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'global-modal';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
}
function closeModal() {
  const m = document.getElementById('global-modal');
  if(m) m.remove();
}

// ── Confirm dialog 
function confirm(msg) {
  return new Promise(resolve => {
    openModal(`
      <div class="modal-header"><h3 class="modal-title">Confirm</h3><button class="modal-close" onclick="closeModal()">×</button></div>
      <p style="color:var(--muted);margin-bottom:1.5rem">${msg}</p>
      <div class="flex gap-2">
        <button class="btn btn-danger" id="confirm-yes">Yes, Proceed</button>
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      </div>
    `);
    setTimeout(() => {
      document.getElementById('confirm-yes')?.addEventListener('click', () => { closeModal(); resolve(true); });
    }, 50);
  });
}

// ── Auth guard 
function requireCustomerAuth() {
  const sess = Store.getSession();
  if (!sess || sess.role !== 'customer') {
    window.location.href = 'index.html';
    return null;
  }
  return sess;
}

function requireAdminAuth() {
  const sess = Store.getSession();
  if (!sess || sess.role !== 'admin') {
    window.location.href = 'admin-login.html';
    return null;
  }
  return sess;
}

// ── Render customer navbar 
function renderCustomerNav(activeLink = '') {
  const sess = Store.getSession();
  const cartCount = Store.getCart().length;
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  nav.innerHTML = `
    <div class="brand">Shop<span>Xpress</span></div>
    <ul class="nav-links">
      <li><a href="home.html" class="${activeLink==='home'?'active':''}">🏠 Home</a></li>
      <li><a href="cart.html" class="${activeLink==='cart'?'active':''}">🛒 My Cart <span class="cart-badge">${cartCount||0}</span></a></li>
      <li><a href="orders.html" class="${activeLink==='orders'?'active':''}">📦 My Orders</a></li>
    </ul>
    <div class="nav-right">
      <span class="nav-user">👤 ${sess?.name || ''}</span>
      <a href="profile.html" class="btn btn-outline btn-sm">Profile</a>
      <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
    </div>
  `;
}

function renderAdminNav(activeSection = '') {
  const nav = document.getElementById('main-nav');
  const sess = Store.getSession();
  if (!nav) return;
  nav.innerHTML = `
    <div class="brand">Shop<span>Xpress</span> <span style="font-size:.7rem;color:var(--muted);font-family:var(--font-body)">Admin</span></div>
    <div class="nav-right">
      <span class="nav-user">🛠️ ${sess?.name || 'Admin'}</span>
      <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
    </div>
  `;
}

function renderSiteFooter() {
  const footer = document.getElementById('main-footer');
  if (!footer) return;

  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="site-footer-inner">
      <div class="site-footer-grid">
        <div>
          <h4>ABOUT US</h4>
          <ul class="site-footer-links">
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Affiliate Program</a></li>
            <li><a href="#">Wholesale Program</a></li>
            <li><a href="#">Press Inquiries</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4>CUSTOMER SUPPORT</h4>
          <ul class="site-footer-links">
            <li><a href="#">Returns & Exchanges</a></li>
            <li><a href="#">Shipping Information</a></li>
            <li><a href="orders.html">Track Your Order</a></li>
            <li><a href="#">Promo Code Lookup</a></li>
            <li><a href="#">Gift Card Lookup</a></li>
          </ul>
        </div>

        <div>
          <h4>QUICK LINKS</h4>
          <ul class="site-footer-links">
            <li><a href="#">Earn Rewards</a></li>
            <li><a href="#">Payment Plans</a></li>
            <li><a href="#">Retail Store Locator</a></li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4>CONNECT WITH US</h4>
          <div class="site-footer-socials">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="X">x</a>
            <a href="#" aria-label="YouTube">yt</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="Pinterest">p</a>
            <a href="#" aria-label="TikTok">tt</a>
          </div>
          <p class="site-footer-note">Want 20 OFF? Sign up for our newsletter. Sign up for SMS alerts and be the first to know.</p>
          <a href="#" class="site-footer-cta">Get in the loop</a>
        </div>
      </div>
    </div>
  `;
}

function logout() {
  const sess = Store.getSession();
  Store.clearSession();
  if (sess?.role === 'admin') {
    window.location.href = 'admin-login.html';
  } else {
    window.location.href = 'index.html';
  }
}

// ── Pagination helper 
function paginate(items, page, perPage = 10) {
  const total = Math.ceil(items.length / perPage);
  const slice = items.slice((page - 1) * perPage, page * perPage);
  return { items: slice, total, page };
}

function renderPagination(container, current, total, onPage) {
  container.innerHTML = '';
  if (total <= 1) return;
  const prev = document.createElement('button');
  prev.className = 'page-btn'; prev.textContent = '← Prev'; prev.disabled = current === 1;
  prev.onclick = () => onPage(current - 1);
  container.appendChild(prev);
  for (let i = 1; i <= total; i++) {
    const b = document.createElement('button');
    b.className = 'page-btn' + (i === current ? ' active' : '');
    b.textContent = i; b.onclick = () => onPage(i);
    container.appendChild(b);
  }
  const next = document.createElement('button');
  next.className = 'page-btn'; next.textContent = 'Next →'; next.disabled = current === total;
  next.onclick = () => onPage(current + 1);
  container.appendChild(next);
}

// ── Badge helper 
function statusBadge(status) {
  const map = {
    'Confirmed':  'badge-confirmed',
    'Delivered':  'badge-delivered',
    'In Transit': 'badge-transit',
    'Cancelled':  'badge-cancelled',
    'Active':     'badge-active',
    'In Active':  'badge-inactive',
  };
  return `<span class="product-badge ${map[status]||''}">${status}</span>`;
}


// ── Format currency 
function rupee(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

// ── Date format 
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
