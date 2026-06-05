/**
 * PRTS Identity Verification System v2.0
 * Core authentication logic for Rhodes Island Database
 */

(function() {
    const API_BASE = '/api';

    const auth = {
        /**
         * Check if a session exists in localStorage
         */
        isLoggedIn: function() {
            return !!localStorage.getItem('prts_user');
        },

        /**
         * Retrieve current session user data
         */
        getUser: function() {
            const data = localStorage.getItem('prts_user');
            return data ? JSON.parse(data) : null;
        },

        /**
         * Authentication: Login
         */
        login: async function(email, password) {
            this.toggleLoading(true);
            this.showMessage(null);

            try {
                const response = await fetch(`${API_BASE}/auth/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    localStorage.setItem('prts_user', JSON.stringify(data.user_info));
                    this.showMessage('AUTHENTICATION SUCCESSFUL. REDIRECTING...', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                    return true;
                } else {
                    this.showMessage(data.message || 'IDENTITY VERIFICATION FAILED.');
                    return false;
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showMessage('CRITICAL SYSTEM ERROR: CONNECTION REFUSED.');
                return false;
            } finally {
                this.toggleLoading(false);
            }
        },

        /**
         * Authentication: Registration
         */
        register: async function(username, email, password) {
            this.toggleLoading(true);
            this.showMessage(null);

            try {
                const response = await fetch(`${API_BASE}/auth/register/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok && (data.status === 'success' || data.email)) {
                    this.showMessage('REGISTRATION COMPLETE. PLEASE LOGIN.', 'success');
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 2000);
                    return true;
                } else {
                    this.showMessage(data.message || 'REGISTRATION REJECTED BY SYSTEM.');
                    return false;
                }
            } catch (error) {
                console.error('Registration error:', error);
                this.showMessage('CRITICAL SYSTEM ERROR: DATABASE OFFLINE.');
                return false;
            } finally {
                this.toggleLoading(false);
            }
        },

        /**
         * End session
         */
        logout: function() {
            localStorage.removeItem('prts_user');
            window.location.href = '/';
        },

        /**
         * UI Helper: Show message to user
         */
        showMessage: function(msg, type = 'error') {
            const box = document.getElementById('auth-message');
            if (!box) return;

            if (!msg) {
                box.style.display = 'none';
                return;
            }

            box.textContent = `> ${msg}`;
            box.className = `auth-message ${type}`;
            box.style.display = 'block';
        },

        /**
         * UI Helper: Toggle loading overlay
         */
        toggleLoading: function(show) {
            const overlay = document.getElementById('auth-loading');
            if (overlay) {
                overlay.style.display = show ? 'flex' : 'none';
            }
        },

        /**
         * Auto-update Navbar based on auth state
         */
        updateNavbar: function() {
            const actions = document.querySelector('.header-actions');
            if (!actions) return;

            const user = this.getUser();
            if (user) {
                actions.innerHTML = `
                    <div class="user-status-area" style="display:flex; align-items:center; gap:15px; background:rgba(255,255,255,0.05); padding:5px 15px; border:1px solid #333;">
                        <div style="display:flex; flex-direction:column; align-items:flex-end;">
                            <span style="font-size:0.6rem; color:var(--teal); font-weight:800; letter-spacing:1px;">ACCESS GRANTED</span>
                            <span class="username" onclick="location.href='/profile.html'" style="cursor:pointer; font-weight:700; color:#fff;">${user.username || user.nickname}</span>
                        </div>
                        <button onclick="auth.logout()" style="background:transparent; border:1px solid var(--red); color:var(--red); padding:4px 10px; font-size:0.7rem; font-weight:800; cursor:pointer; transition:all 0.3s;" onmouseover="this.style.background='var(--red)'; this.style.color='#000';" onmouseout="this.style.background='transparent'; this.style.color='var(--red)';">LOGOUT // EXIT</button>
                    </div>
                `;
            } else {
                actions.innerHTML = `
                    <div style="display:flex; gap:10px;">
                        <a href="/login.html" class="nav-link" style="border:1px solid #444; padding:5px 15px; color:#aaa; font-size:0.8rem; font-weight:700; text-decoration:none;">LOGIN</a>
                        <a href="/register.html" class="nav-link" style="background:var(--teal); color:#000; padding:5px 15px; font-size:0.8rem; font-weight:800; text-decoration:none; box-shadow: 0 0 10px rgba(0,255,204,0.3);">REGISTER</a>
                    </div>
                `;
            }
        }
    };

    // Export to window
    window.auth = auth;

    // Initialize UI listeners
    document.addEventListener('DOMContentLoaded', () => {
        auth.updateNavbar();

        // Login Form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                await auth.login(email, password);
            });
        }

        // Register Form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirm = document.getElementById('confirm-password').value;

                if (password !== confirm) {
                    auth.showMessage('PASSWORD MISMATCH. VALIDATION FAILED.');
                    return;
                }

                await auth.register(username, email, password);
            });
        }
    });

})();

