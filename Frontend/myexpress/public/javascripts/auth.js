(function() {
    const API_BASE = '/api';

    const auth = {
        // Check if user is logged in
        isLoggedIn: function() {
            return !!localStorage.getItem('prts_user');
        },

        // Get user data
        getUser: function() {
            const data = localStorage.getItem('prts_user');
            return data ? JSON.parse(data) : null;
        },

        // Login action
        login: async function(email, password) {
            try {
                const response = await fetch(`${API_BASE}/auth/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    localStorage.setItem('prts_user', JSON.stringify(data.user_info));
                    return { status: 'success' };
                } else {
                    return { status: 'error', message: data.message };
                }
            } catch (err) {
                console.error('Login error:', err);
                return { status: 'error', message: '系統連線失敗' };
            }
        },

        // Register action
        register: async function(formData) {
            try {
                const response = await fetch(`${API_BASE}/auth/register/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok || data.status === 'success') {
                    return { status: 'success' };
                } else {
                    return { status: 'error', message: data.message || '建檔申請被拒絕' };
                }
            } catch (err) {
                console.error('Registration error:', err);
                return { status: 'error', message: '系統連線失敗' };
            }
        },

        // Logout action
        logout: function() {
            localStorage.removeItem('prts_user');
            location.reload();
        },

        // Update Navigation Bar
        updateNavbar: function() {
            const headerActions = document.querySelector('.header-actions');
            if (!headerActions) return;

            const user = this.getUser();
            
            // 移除現有的 Auth 相關按鈕，避免重複或衝突，同時保留其他導航按鈕（如 BACK TO LIST）
            const existingAuthBtns = headerActions.querySelectorAll('.btn-auth-item');
            existingAuthBtns.forEach(btn => btn.remove());

            // 輔助函式：建立統一風格的按鈕
            const createBtn = (text, className, onClick) => {
                const btn = document.createElement('button');
                btn.className = `${className} btn-auth-item`;
                btn.innerHTML = text;
                btn.onclick = onClick;
                btn.style.marginLeft = '8px';
                return btn;
            };

            if (user) {
                // Admin button only for authorized personnel
                if (user.is_admin || user.role === 'admin') {
                    headerActions.appendChild(createBtn(
                        `<span class="icon">⚙</span> ADMIN //`,
                        'btn btn-outline',
                        () => { location.href = '/admin.html'; }
                    ));
                }

                // Profile button
                headerActions.appendChild(createBtn(
                    `<span class="icon">👤</span> ${user.nickname} // PROFILE`,
                    'btn btn-filled btn-teal',
                    () => { location.href = '/profile.html'; }
                ));

                // Logout button
                headerActions.appendChild(createBtn(
                    'LOGOUT //',
                    'btn btn-red',
                    (e) => {
                        e.stopPropagation();
                        auth.logout();
                    }
                ));
            } else {
                // Guest view: Show Login button
                headerActions.appendChild(createBtn(
                    `<span class="icon">👤</span> LOGIN //`,
                    'btn btn-filled btn-teal',
                    () => { location.href = '/login.html'; }
                ));
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        auth.updateNavbar();
    });

    window.auth = auth;
})();
