/**
 * guides_list.js - Rhodes Island Tactical Guides List
 */

(function() {
    const container = document.getElementById('guides-list-container');

    async function fetchGuides() {
        try {
            const response = await fetch('/api/guides/list/');
            const data = await response.json();

            if (data.status === 'success') {
                renderGuides(data.data);
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('CONNECTION_ERROR // 無法連接至 PRTS 伺服器');
        }
    }

    function renderGuides(guides) {
        if (!guides || guides.length === 0) {
            container.innerHTML = '<div class="loading-state">[ NO DATA // 暫無數據 ]</div>';
            return;
        }

        container.innerHTML = guides.map(guide => `
            <a href="/guide_detail.html?id=${guide.guide_id}" class="guide-row">
                <div class="target-stage">${guide.stage_id}</div>
                <div class="guide-info">
                    <div class="guide-title">${guide.title}</div>
                    <div class="guide-meta">${formatDate(guide.created_at)} // AUTHOR: <span>${guide.author}</span></div>
                </div>
                <div class="status-tag">[ PUBLISHED ]</div>
                <button class="btn-read" onclick="location.href='/guide_detail.html?id=${guide.guide_id}'">[ READ LOG // 讀取日誌 ]</button>
            </a>
        `).join('');
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'UNKNOWN TIME';
        const date = new Date(dateStr);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function showError(msg) {
        container.innerHTML = `<div class="loading-state" style="color:var(--red);">[ ERROR: ${msg} ]</div>`;
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', fetchGuides);
})();
