(function() {
    const API_BASE = '/api';
    
    // Get stage ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const stageId = urlParams.get('id');

    if (!stageId) {
        document.getElementById('stage-detail-container').innerHTML = `
            <div class="panel" style="padding: 40px; text-align: center;">
                <h2 style="color: var(--red);">[ ERROR: MISSION_ID_MISSING ]</h2>
                <p>未指定有效的作戰代碼。正在返回首頁...</p>
            </div>
        `;
        setTimeout(() => window.location.href = '/', 3000);
        return;
    }

    // Material name to icon mapping (fallback)
    const materialIconMap = {
        '固源岩組': '/static/images/materials/orirock_cube.png',
        '固源岩': '/static/images/materials/orirock.png',
        '糖': '/static/images/materials/sugar.png',
        '糖組': '/static/images/materials/sugar_pack.png',
        '異鐵': '/static/images/materials/oriron.png',
        '異鐵組': '/static/images/materials/oriron_cluster.png',
        '聚酸酯': '/static/images/materials/polyester.png',
        '聚酸酯組': '/static/images/materials/polyester_pack.png'
        // ... can add more as needed
    };

    async function init() {
        try {
            await Promise.all([
                fetchStageDetail(),
                fetchStageDrops(),
                fetchStageGuides()
            ]);
        } catch (err) {
            console.error('Failed to load stage data:', err);
        }
    }

    async function fetchStageDetail() {
        const container = document.getElementById('stage-detail-container');
        try {
            const resp = await fetch(`${API_BASE}/stages/${stageId}/detail/`);
            const data = await resp.json();

            if (data.status === 'success') {
                const stage = data.data;
                const mapUrl = stage.map_url || '/static/images/maps/default_map.png';
                
                const user = JSON.parse(localStorage.getItem('prts_user') || '{}');
                const adminBtn = user.is_admin ? `<button id="btn-delete-stage" style="margin-top:10px; background:transparent; border:1px solid var(--red); color:var(--red); cursor:pointer; padding:5px; font-size:0.7rem;">[ DELETE STAGE ]</button>` : '';

                container.innerHTML = `
                    <div class="stage-header-panel">
                        <section class="stage-map-box">
                            <img src="${mapUrl}" class="stage-map-img" alt="${stage.name}" onerror="this.onerror=null; this.src='/static/images/maps/default_map.png'">
                            <div class="stage-title-overlay">
                                <div class="stage-code-tag">${stage.id}</div>
                                <h1 class="stage-name-text">${stage.name || stage.id}</h1>
                                ${adminBtn}
                            </div>
                        </section>
                        ... (略)
                `;

                if (user.is_admin) {
                    document.getElementById('btn-delete-stage')?.addEventListener('click', () => adminDeleteStage(stage.id));
                }
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            container.innerHTML = `<div class="panel" style="padding: 40px; color: var(--red);">無法取得關卡基本資料: ${err.message}</div>`;
        }
    }

    async function fetchStageDrops() {
        const grid = document.getElementById('drops-grid');
        try {
            const resp = await fetch(`${API_BASE}/stages/${stageId}/drops/`);
            const data = await resp.json();

            if (data.status === 'success') {
                const drops = data.drops;
                if (drops.length === 0) {
                    grid.innerHTML = '<div style="color: var(--muted); padding: 20px;">此關卡目前暫無掉落數據記錄。</div>';
                    return;
                }

                grid.innerHTML = drops.map(drop => {
                    const icon = materialIconMap[drop.material] || `/static/images/materials/placeholder.png`;
                    return `
                        <div class="drop-item-card">
                            <div class="drop-icon">
                                <img src="${icon}" alt="${drop.material}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.onerror=null; this.src='/static/images/materials/placeholder.png'">
                            </div>
                            <div class="drop-name">${drop.material}</div>
                            <span class="drop-rate-tag">${drop.drop_rate}</span>
                        </div>
                    `;
                }).join('');
            }
        } catch (err) {
            grid.innerHTML = '<div style="color: var(--red);">掉落數據分析異常。</div>';
        }
    }

    async function fetchStageGuides() {
        const list = document.getElementById('guides-list');
        const addGuideLink = document.getElementById('add-guide-link');
        
        // Setup direct link to editor with stage ID
        addGuideLink.href = `/guide_editor.html?stage_id=${stageId}`;

        try {
            const resp = await fetch(`${API_BASE}/stages/${stageId}/guides/`);
            const data = await resp.json();

            if (data.status === 'success') {
                const guides = data.data;
                if (guides.length === 0) {
                    list.innerHTML = '<div style="color: var(--muted); padding: 20px;">尚無博士上傳此關卡的作戰錄影。</div>';
                    return;
                }

                list.innerHTML = guides.map(guide => `
                    <a href="/guide_detail.html?id=${guide.id}" class="guide-item">
                        <div class="guide-item-title">${guide.title}</div>
                        <div class="guide-item-meta">
                            <span>錄製者: ${guide.author}</span>
                            <span style="margin: 0 10px;">|</span>
                            <span>${guide.date}</span>
                        </div>
                    </a>
                `).join('');
            }
        } catch (err) {
            list.innerHTML = '<div style="color: var(--red);">指南數據檢索失敗。</div>';
        }
    }

    async function adminDeleteStage(id) {
        if (!confirm(`確定要刪除關卡 ${id} 及其所有相關資料（掉落、攻略）嗎？`)) return;
        try {
            const resp = await fetch(`${API_BASE}/admin/stages/${id}/delete/`, { method: 'DELETE' });
            const data = await resp.json();
            if (data.status === 'success') {
                alert(data.message);
                window.location.href = '/';
            }
        } catch (err) { console.error(err); }
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof auth !== 'undefined') {
            auth.updateNavbar();
        }
        init();
    });
})();
