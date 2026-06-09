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
                const adminLink = user.is_admin ? `<button class="btn btn-outline" onclick="location.href='/admin_panel.html'" style="color:#f0c14b; border-color:#f0c14b;"><span class="icon">⚙</span> ADMIN</button>` : '';
                container.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px;">
                        ${adminLink}
                        <div style="display:flex; flex-direction:column; align-items:flex-end; background:rgba(255,255,255,0.05); padding:2px 10px; border:1px solid #444; border-radius: 4px; cursor: pointer;" onclick="location.href='/profile.html'">
                            <span style="font-size:0.7rem; color:var(--teal); font-weight:800;">${user.nickname}</span>
                            <span style="font-size:0.5rem; color:var(--muted);">${user.is_admin ? 'ADMINISTRATOR' : 'OPERATOR'}</span>
                        </div>
                        <button class="btn btn-filled" onclick="auth.logout()" style="padding:4px 8px; font-size:0.6rem;">LOGOUT</button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <button class="btn btn-outline" onclick="location.href='/admin_panel.html'"><span class="icon">⚙</span> ADMIN</button>
                    <button class="btn btn-filled" onclick="location.href='/login.html'"><span class="icon">👤</span> LOGIN</button>
                    <button class="btn btn-outline" onclick="location.href='/register.html'" style="margin-left: 8px;">SIGN UP</button>
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

