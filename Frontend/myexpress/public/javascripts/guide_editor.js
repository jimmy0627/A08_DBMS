/**
 * guide_editor.js - PRTS Tactical Data Entry
 * Handles fetching stages and submitting new guides.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Identity Check
    const user = auth.getUser();
    if (!user) {
        auth.showMessage('UNAUTHORIZED ACCESS // 請先登入系統');
        setTimeout(() => {
            location.href = '/login.html';
        }, 1500);
        return;
    }

    const stageSelect = document.getElementById('stage-id');
    const guideForm = document.getElementById('guide-form');
    const statusText = document.getElementById('status-text');
    const submitBtn = document.getElementById('submit-btn');

    // 2. Load Stages from API
    try {
        statusText.textContent = 'STATUS: CONNECTING TO DATABASE...';
        const response = await fetch('/api/stages/');
        const result = await response.json();

        if (result.status === 'success') {
            result.data.forEach(stage => {
                const option = document.createElement('option');
                option.value = stage.id;
                option.textContent = `${stage.id} - ${stage.name}`;
                stageSelect.appendChild(option);
            });
            statusText.textContent = 'STATUS: AWAITING INPUT...';
        } else {
            statusText.textContent = 'STATUS: DATABASE ERROR';
            auth.showMessage('FAILED TO LOAD STAGES // 區域載入失敗');
        }
    } catch (err) {
        console.error('Fetch stages error:', err);
        statusText.textContent = 'STATUS: CONNECTION FAILED';
    }

    // 3. Form Submission
    guideForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const stageId = stageSelect.value;
        const title = document.getElementById('guide-title').value.trim();
        const content = document.getElementById('guide-content').value.trim();

        if (!stageId || !title || !content) {
            auth.showMessage('INPUT INCOMPLETE // 請確保所有欄位皆已填寫');
            return;
        }

        // Lock UI
        submitBtn.disabled = true;
        submitBtn.textContent = '[ UPLOADING... ]';
        statusText.textContent = 'STATUS: TRANSMITTING ENCRYPTED DATA...';

        try {
            const response = await fetch('/api/guides/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    stage_id: stageId,
                    title: title,
                    content: content
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                statusText.textContent = 'STATUS: DATA UPLOADED SUCCESSFULLY';
                auth.showMessage('[ 檔案已成功錄入資料庫 ]', 'success');
                setTimeout(() => {
                    location.href = '/profile.html';
                }, 2000);
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Submission error:', err);
            statusText.textContent = 'STATUS: UPLOAD FAILED';
            auth.showMessage('SYSTEM ERROR // 檔案上傳失敗');
            submitBtn.disabled = false;
            submitBtn.textContent = '[ SUBMIT // 授權發布 ]';
        }
    });
});