/**
 * register.js - Rhodes Island Personnel Dossier Creation
 * Handles registration form logic, validation, and API submission.
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const codenameInput = document.getElementById('codename');
    const availabilityBadge = document.getElementById('availability-badge');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const securityLevelBar = document.querySelector('.security-level-bar');
    const securityText = document.querySelector('.security-level-text');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = submitBtn.querySelector('.btn-text');

    // 1. Live Codename Validation
    let validationTimeout;
    codenameInput.addEventListener('input', () => {
        const val = codenameInput.value.trim();
        availabilityBadge.style.display = 'none';
        
        if (val.length < 3) return;

        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(async () => {
            try {
                // Simulating API check for codename availability
                // In a real app, this would be: fetch(`/api/check-username?username=${val}`)
                const isAvailable = val.length >= 3 && val.length <= 16; 
                
                availabilityBadge.style.display = 'inline';
                if (isAvailable) {
                    availabilityBadge.textContent = '[ AVAILABLE ]';
                    availabilityBadge.style.color = '#4CAF50';
                } else {
                    availabilityBadge.textContent = '[ CONFLICT ]';
                    availabilityBadge.style.color = 'var(--red)';
                }
            } catch (err) {
                console.error('Check failed', err);
            }
        }, 500);
    });

    // 2. Password Strength Logic
    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let score = 0;
        if (val.length > 5) score++;
        if (val.length > 10) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        securityLevelBar.style.width = `${(score / 5) * 100}%`;
        
        if (score <= 1) {
            securityText.textContent = 'SECURITY LEVEL: LOW';
            securityLevelBar.style.backgroundColor = 'var(--red)';
        } else if (score <= 3) {
            securityText.textContent = 'SECURITY LEVEL: HIGH';
            securityLevelBar.style.backgroundColor = 'var(--gold)';
        } else {
            securityText.textContent = 'SECURITY LEVEL: MAX';
            securityLevelBar.style.backgroundColor = 'var(--teal)';
        }
    });

    // 3. Form Submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic verification
        if (passwordInput.value !== confirmInput.value) {
            alert('SECURITY KEY MISMATCH // 密鑰不一致');
            return;
        }

        const captchaInput = document.getElementById('captcha').value.trim();
        const validAnswers = ['阿米婭', 'Amiya', '阿米雅', '阿米娅'];
        if (!validAnswers.includes(captchaInput)) {
            alert('NEURAL CHECK FAILED // 識別失敗：請輸入正確的領袖名稱');
            return;
        }

        // UI State: ENCRYPTING...
        submitBtn.disabled = true;
        submitText.textContent = 'ENCRYPTING... // 正在加密數據';
        
        const formData = {
            email: document.getElementById('email').value,
            password: passwordInput.value,
            nickname: codenameInput.value, // for display
            username: codenameInput.value  // often used as the primary identifier in Django
        };

        try {
            const result = await auth.register(formData);

            if (result.status === 'success') {
                alert('DOSSIER CREATED // 建檔成功');
                location.href = '/login.html';
            } else {
                alert(`REGISTRATION FAILED: ${result.message || 'Unknown Error'}`);
                submitBtn.disabled = false;
                submitText.textContent = 'SUBMIT DOSSIER // 提交建檔申請';
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert('CONNECTION ERROR // 連線異常，請稍後再試');
            submitBtn.disabled = false;
            submitText.textContent = 'SUBMIT DOSSIER // 提交建檔申請';
        }
    });
});
