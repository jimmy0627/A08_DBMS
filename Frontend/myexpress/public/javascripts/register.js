/**
 * register.js - Personnel Dossier Creation
 * Handles registration form logic and validation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nickname = document.getElementById('nickname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Basic Validation
        if (password !== confirmPassword) {
            auth.showMessage('SECURITY KEY MISMATCH // 密碼不一致');
            return;
        }

        if (password.length < 6) {
            auth.showMessage('PASSWORD TOO WEAK // 密碼長度不足 (至少6位)');
            return;
        }

        // Disable UI
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;

        const result = await auth.register(email, password, nickname);

        if (result.success) {
            auth.showMessage(result.message, 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            auth.showMessage(result.message);
            submitBtn.disabled = false;
        }
    });
});
