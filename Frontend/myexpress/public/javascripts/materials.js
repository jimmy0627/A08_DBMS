(function() {
    const API_BASE = '/api';

    const state = {
        allData: [],
        filterTier: 'all',
        searchQuery: ''
    };

    const elements = {
        container: document.querySelector('#materials-container'),
        searchInput: document.querySelector('#mat-search'),
        tierButtons: document.querySelectorAll('.tier-btn')
    };

    /**
     * Determine Tier based on material name (Mock logic based on Arknights patterns)
     * In a real DB, we would have a 'tier' or 'rarity' column in the material table.
     */
    function getTierFromName(name) {
        const t5 = ['D32鋼', '雙極納米片', '聚合劑', '晶體電子單元', '燒結核凝晶', '轉質鹽聚塊'];
        const t4 = ['RMA70-24', '三水錳礦', '五水研磨石', '改量裝置', '異鐵塊', '提純源岩', '糖聚塊', '聚酸酯塊', '酮陣列', '精煉溶劑', '熾合金塊', '晶體電路'];
        const t3 = ['固源岩組', '異鐵組', '糖組', '聚酸酯組', '酮凝集組', '全新裝置', '扭轉醇', '輕錳礦', '研磨石', 'RMA70-12', '凝膠', '熾合金', '晶體元件', '半自然溶劑', '化合切削液', '轉質鹽組'];
        
        if (t5.some(m => name.includes(m))) return 5;
        if (t4.some(m => name.includes(m))) return 4;
        if (t3.some(m => name.includes(m))) return 3;
        if (name.includes('卷3')) return 3;
        if (name.includes('卷2')) return 2;
        if (name.includes('卷1')) return 1;
        
        // Basic pattern for T2/T1
        if (name.endsWith('組') || name.endsWith('礦') || name.endsWith('裝置')) return 3;
        if (name.length <= 2) return 2; // e.g. 糖, 異鐵
        return 1;
    }

    async function fetchMaterials() {
        try {
            const response = await fetch(`${API_BASE}/materials/list/`);
            const result = await response.json();
            if (result.status === 'success') {
                state.allData = result.data.map(m => ({
                    ...m,
                    tier: getTierFromName(m.name)
                }));
                renderList();
            }
        } catch (error) {
            console.error('Fetch error:', error);
            elements.container.innerHTML = '<div class="loading-state" style="color:var(--red);">ERROR: FAILED TO CONNECT TO LOGISTICS DB</div>';
        }
    }

    function renderList() {
        if (!elements.container) return;

        const filtered = state.allData.filter(m => {
            const matchesTier = state.filterTier === 'all' || m.tier === parseInt(state.filterTier);
            const matchesSearch = m.name.toLowerCase().includes(state.searchQuery) || 
                                 (m.best_stage?.id || '').toLowerCase().includes(state.searchQuery);
            return matchesTier && matchesSearch;
        });

        if (filtered.length === 0) {
            elements.container.innerHTML = '<div class="loading-state">NO MATCHING ASSETS FOUND.</div>';
            return;
        }

        elements.container.innerHTML = filtered.map(m => {
            const tierClass = `tier-${m.tier}`;
            const bestDrop = m.best_stage ? `
                <div class="drop-info">
                    <div class="stage-badge">${m.best_stage.id} // ${m.best_stage.name} <span class="rate-tag">${m.best_stage.drop_rate}</span></div>
                    <div class="ap-cost">EXPECTED AP: ${m.best_stage.ap_cost || '--'} AP</div>
                </div>
            ` : '<div class="drop-info"><div class="ap-cost" style="color:var(--muted);">[ NO DIRECT DROP DATA ]</div></div>';

            return `
                <div class="material-row">
                    <div class="col-identity">
                        <div class="item-icon ${tierClass}">${m.name[0]}</div>
                        <div class="item-info">
                            <div style="font-size: 1.1rem; font-weight: 800; color: var(--text);">${m.name}</div>
                            <div style="font-size: 0.7rem; color: var(--muted); letter-spacing: 0.1em; margin-top: 2px;">LOGISTICS-ID: MAT-${m.id.toString().padStart(3, '0')}</div>
                        </div>
                    </div>
                    ${bestDrop}
                    <div class="usage-stats">
                        <span class="count-val">${m.usage_count}</span>
                        <span class="usage-label">OPERATORS</span>
                    </div>
                    <div class="col-action">
                        <button class="btn btn-outline btn-sm" onclick="alert('詳細消耗報告尚未實作')">REPORT</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function setupListeners() {
        elements.searchInput?.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim().toLowerCase();
            renderList();
        });

        elements.tierButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.tierButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.filterTier = btn.dataset.tier;
                renderList();
            });
        });
    }

    async function init() {
        setupListeners();
        await fetchMaterials();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
