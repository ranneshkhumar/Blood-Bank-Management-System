// ============================================
// BLOOD BANK MS — Login Page Script
// Connects to backend /api/login endpoint
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    const token = sessionStorage.getItem('bbms_token');
    const user = sessionStorage.getItem('bbms_user');
    if (token && user) {
        const userData = JSON.parse(user);
        redirectToDashboard(userData.role);
        return;
    }

    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const emailGroup = document.getElementById('emailGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // --- Toggle Password Visibility ---
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        const eyeOpen = togglePasswordBtn.querySelector('.eye-open');
        const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');

        eyeOpen.style.display = isPassword ? 'none' : 'block';
        eyeClosed.style.display = isPassword ? 'block' : 'none';

        togglePasswordBtn.setAttribute('aria-label',
            isPassword ? 'Hide password' : 'Show password'
        );
    });

    // --- Email Validation ---
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(group, errorEl, message) {
        group.classList.add('error');
        errorEl.textContent = message;
    }

    function clearError(group, errorEl) {
        group.classList.remove('error');
        errorEl.textContent = '';
    }

    // Clear errors on input
    emailInput.addEventListener('input', () => {
        if (emailGroup.classList.contains('error')) {
            clearError(emailGroup, emailError);
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordGroup.classList.contains('error')) {
            clearError(passwordGroup, passwordError);
        }
    });

    // --- Form Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isValid = true;

        // Validate email
        const emailVal = emailInput.value.trim();
        if (!emailVal) {
            showError(emailGroup, emailError, 'Email address is required');
            isValid = false;
        } else if (!validateEmail(emailVal)) {
            showError(emailGroup, emailError, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailGroup, emailError);
        }

        // Validate password
        const passVal = passwordInput.value;
        if (!passVal) {
            showError(passwordGroup, passwordError, 'Password is required');
            isValid = false;
        } else if (passVal.length < 6) {
            showError(passwordGroup, passwordError, 'Password must be at least 6 characters');
            isValid = false;
        } else {
            clearError(passwordGroup, passwordError);
        }

        if (!isValid) {
            const firstError = form.querySelector('.input-group.error input');
            if (firstError) {
                firstError.style.animation = 'shake 0.4s ease-in-out';
                firstError.addEventListener('animationend', () => {
                    firstError.style.animation = '';
                }, { once: true });
            }
            return;
        }

        // Show loading state
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailVal, password: passVal })
            });

            const data = await response.json();

            if (!response.ok) {
                setLoading(false);
                showError(emailGroup, emailError, data.error || 'Login failed');
                return;
            }

            // Store auth data
            sessionStorage.setItem('bbms_token', data.token);
            sessionStorage.setItem('bbms_user', JSON.stringify(data.user));

            // Show success
            showSuccessState(data.user.role);

        } catch (err) {
            setLoading(false);
            showError(emailGroup, emailError, 'Network error. Please try again.');
            console.error('Login error:', err);
        }
    });

    function setLoading(loading) {
        const btnText = loginBtn.querySelector('.btn-text');
        const btnArrow = loginBtn.querySelector('.btn-arrow');
        const btnLoader = loginBtn.querySelector('.btn-loader');

        if (loading) {
            loginBtn.classList.add('loading');
            btnText.style.display = 'none';
            btnArrow.style.display = 'none';
            btnLoader.style.display = 'flex';
        } else {
            loginBtn.classList.remove('loading');
            btnText.style.display = '';
            btnArrow.style.display = '';
            btnLoader.style.display = 'none';
        }
    }

    function showSuccessState(role) {
        setLoading(false);
        const btnText = loginBtn.querySelector('.btn-text');
        btnText.textContent = '✓ Success!';
        loginBtn.style.background = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)';
        loginBtn.style.boxShadow = '0 4px 14px rgba(34, 197, 94, 0.3)';

        setTimeout(() => {
            redirectToDashboard(role);
        }, 800);
    }

    function redirectToDashboard(role) {
        switch (role) {
            case 'staff':      window.location.href = 'dashboard.html'; break;
            case 'admin':      window.location.href = 'admin.html';     break;
            case 'superadmin': window.location.href = 'superadmin.html'; break;
            default:           window.location.href = 'dashboard.html';
        }
    }

    // --- Shake Animation ---
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    // --- Parallax effect ---
    document.addEventListener('mousemove', (e) => {
        const cells = document.querySelectorAll('.cell');
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        cells.forEach((cell, i) => {
            const speed = (i + 1) * 3;
            cell.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
});
