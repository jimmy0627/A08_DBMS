/**
 * auth.js - Rhodes Island Identity Management System
 * Core logic for authentication, session handling, and API communication.
 */

(function() {
    const API_BASE = '/api';

    const auth = {
        getUser: function() {
            try {
                const data = localStorage.getItem('prts_user');
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        },

        isLoggedIn: function() {
            return !!this.getUser();
        },

        login: async function(email, password) {
            this.setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/auth/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (data.status === 'success') {
                    localStorage.setItem('prts_user', JSON.stringify(data.user_info));
                    return { success: true, message: data.message };
                } else {
                    return { success: false, message: data.message };
                }
            } catch (err) {
                return { success: false, message: 'CONNECTION ERROR // 連線異常' };
            } finally {
                this.setLoading(false);
            }
        },

        register: async function(email, password, nickname) {
            this.setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/auth/register/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, nickname })
                });

                const data = await response.json();
                if (data.status === 'success') {
                    return { success: true, message: data.message };
                } else {
                    return { success: false, message: data.message };
                }
            } catch (err) {
                return { success: false, message: 'CONNECTION ERROR // 連線異常' };
            } finally {
                this.setLoading(false);
            }
        },

        logout: function() {
            localStorage.removeItem('prts_user');
            window.location.href = '/login.html';
        },

        setLoading: function(isLoading) {
            const loader = document.getElementById('auth-loading');
            if (loader) loader.style.display = isLoading ? 'flex' : 'none';
        },

        showMessage: function(msg, type = 'error') {
            const box = document.getElementById('auth-message');
            if (!box) return;
            if (!msg) {
                box.style.display = 'none';
                return;
            }
            box.textContent = `> ${msg}`;
            box.dataset.type = type;
            box.style.display = 'block';
            box.style.color = type === 'success' ? '#29b6f6' : '#d32f2f';
        },

        updateNavbar: function() {
            const container = document.querySelector('.header-actions');
            if (!container) return;

            const user = this.getUser();
            if (user) {
                container.innerHTML = `
                    <div style="display:flex; align-items:center; gap:15px; background:rgba(255,255,255,0.05); padding:5px 12px; border:1px solid #333;">
                        <div style="display:flex; flex-direction:column; align-items:flex-end;">
                            <span style="font-size:0.6rem; color:#29b6f6; font-weight:800; letter-spacing:1px;">ACCESS GRANTED</span>
                            <span onclick="location.href='/profile.html'" style="cursor:pointer; font-weight:700; color:#fff;">${user.nickname}</span>
                        </div>
                        <button onclick="auth.logout()" style="background:transparent; border:1px solid #d32f2f; color:#d32f2f; padding:4px 8px; font-size:0.7rem; font-weight:800; cursor:pointer;">LOGOUT</button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div style="display:flex; gap:10px;">
                        <button onclick="location.href='/login.html'" style="background:transparent; border:1px solid #444; color:#aaa; padding:6px 15px; font-weight:700; cursor:pointer;">LOGIN</button>
                        <button onclick="location.href='/register.html'" style="background:#29b6f6; border:none; color:#000; padding:6px 15px; font-weight:800; cursor:pointer;">REGISTER</button>
                    </div>
                `;
            }
        }
    };

    window.auth = auth;
    document.addEventListener('DOMContentLoaded', () => {
        auth.updateNavbar();

        // 登入表單元件監聽
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;

                if (!email || !password) {
                    auth.showMessage('EMAIL AND PASSWORD REQUIRED');
                    return;
                }

                const result = await auth.login(email, password);
                if (result.success) {
                    auth.showMessage(result.message, 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                } else {
                    auth.showMessage(result.message);
                }
            });
        }
    });
})();

