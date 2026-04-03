// ============================================
// BBMS — Shared Frontend Utilities
// Auth helpers, API wrapper, token management
// ============================================

const API_BASE = window.location.origin + '/api';

// ---- Token Management ----
function getToken() {
    return sessionStorage.getItem('bbms_token');
}

function getUser() {
    const userData = sessionStorage.getItem('bbms_user');
    return userData ? JSON.parse(userData) : null;
}

function setAuth(token, user) {
    sessionStorage.setItem('bbms_token', token);
    sessionStorage.setItem('bbms_user', JSON.stringify(user));
}

function clearAuth() {
    sessionStorage.removeItem('bbms_token');
    sessionStorage.removeItem('bbms_user');
}

function logout() {
    clearAuth();
    window.location.href = 'index.html';
}

// ---- Auth Check ----
function checkAuth(allowedRoles) {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        window.location.href = 'index.html';
        return false;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to correct dashboard
        redirectToDashboard(user.role);
        return false;
    }

    return true;
}

function redirectToDashboard(role) {
    switch (role) {
        case 'staff':      window.location.href = 'dashboard.html'; break;
        case 'admin':      window.location.href = 'admin.html';     break;
        case 'superadmin': window.location.href = 'superadmin.html'; break;
        default:           window.location.href = 'index.html';
    }
}

// ---- API Wrapper ----
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            clearAuth();
            window.location.href = 'index.html';
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        throw err;
    }
}

// ---- Date helpers ----
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dtStr) {
    if (!dtStr) return '—';
    const date = new Date(dtStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ---- Toast Notification ----
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="toast-msg">${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
