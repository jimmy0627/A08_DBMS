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
     */
    function getTierFromName(name) {
        if (['D32鋼', '聚合劑', '雙極納米片', '燒結核凝晶', '晶體電子單元'].includes(name)) return 5;
        if (name.includes('塊') || name.includes('陣列') || ['三水錳礦', '五水研磨石', 'RMA70-24', '白馬醇', '改良裝置'].includes(name)) return 4;
        if (name.includes('組') || name.includes('酮凝集') || name.includes('扭轉醇') || name.includes('裝置')) return 3;
        if (name.includes('固源岩') || name.includes('異鐵') || name.includes('聚酸酯') || name.includes('糖')) return 2;
        return 1;
    }

    function getIconPathFromName(name) {
        const mapping = {
            'D32鋼': 'd32_steel.png',
            '聚合劑': 'polymerization_preparation.png',
            '雙極納米片': 'bipolar_nanoflake.png',
            '三水錳礦': 'manganese_trihydrate.png',
            '五水研磨石': 'grindstone_pentahydrate.png',
            'RMA70-24': 'RMA70-24.png',
            '糖聚塊': 'sugar_lump.png',
            '糖組': 'sugar_pack.png',
            '糖': 'sugar.png',
            '聚酸酯塊': 'polyester_pack.png',
            '聚酸酯組': 'polyester.png',
            '異鐵塊': 'oriron_block.png',
            '異鐵組': 'oriron_pack.png',
            '異鐵': 'oriron.png',
            '酮陣列': 'ketone_array.png',
            '酮凝集組': 'polyketon.png',
            '扭轉醇': 'loxic_kohl.png',
            '白馬醇': 'white_horse_kohl.png',
            '改良裝置': 'optimized_device.png',
            '裝置': 'device.png',
            '提純源岩': 'orirock_concentration.png',
            '固源岩組': 'orirock_cube.png',
            '固源岩': 'orirock.png'
        };
        const fileName = mapping[name] || `${name}.png`;
        return `/static/images/materials/${fileName}`;
    }

    async function fetchMaterials() {
        try {
            const response = await fetch(`${API_BASE}/materials/list/`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            if (result.status === 'success') {
                state.allData = result.data.map(m => ({
                    ...m,
                    tier: getTierFromName(m.name)
                }));
                renderList();
            } else {
                throw new Error(result.message || 'API responded with failure status');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            elements.container.innerHTML = `<div class="loading-state" style="color:var(--red);">
                ERROR: FAILED TO CONNECT TO LOGISTICS DB<br>
                <small style="font-size:0.8rem; opacity:0.7;">[ ${error.message} ]</small>
            </div>`;
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
            const tierClass = `tier-${m.tier || 1}`;
            const bestDrop = m.best_stage ? `
                <div class="drop-info">
                    <div class="stage-badge">${m.best_stage.id} // ${m.best_stage.name} <span class="rate-tag">${m.best_stage.drop_rate}</span></div>
                    <div class="ap-cost">EXPECTED AP: ${m.best_stage.ap_cost || '--'} AP</div>
                </div>
            ` : '<div class="drop-info"><div class="ap-cost" style="color:var(--muted);">[ NO DIRECT DROP DATA ]</div></div>';

            const iconUrl = m.icon_url || getIconPathFromName(m.name);

            return `
                <div class="material-row">
                    <div class="col-identity">
                        <div class="item-icon ${tierClass}" style="display: flex; align-items: center; justify-content: center; overflow: hidden; background: #000; border: 1px solid var(--border);">
                            <img src="${iconUrl}" alt="${m.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='${m.name[0]}';" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
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
                        <button class="btn btn-outline btn-sm" onclick="showUsageReport(${m.id}, '${m.name}')">REPORT</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function showUsageReport(id, name) {
        const modal = document.getElementById('usage-modal');
        const content = document.getElementById('modal-content');
        const title = document.getElementById('modal-title');
        
        if (!modal || !content) return;

        title.innerText = `${name} // 消耗需求報告`;
        content.innerHTML = '<div class="loading-state">ACCESSING PERSONNEL FILES...</div>';
        modal.style.display = 'block';

        try {
            const response = await fetch(`${API_BASE}/materials/${id}/usage/`);
            const data = await response.json();

            if (data.status === 'success') {
                const { elite, skill, module } = data.usage;
                let html = '';

                const renderSection = (title, list) => {
                    if (list.length === 0) return '';
                    return `
                        <div style="margin-bottom: 24px;">
                            <h4 style="color: var(--teal); border-left: 3px solid var(--teal); padding-left: 10px; font-size: 0.85rem; margin-bottom: 12px;">${title}</h4>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${list.map(item => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 16px; border: 1px solid rgba(255,255,255,0.05);">
                                        <div>
                                            <span style="font-weight: 800; color: var(--text);">${item.name}</span>
                                            <span style="font-size: 0.75rem; color: var(--muted); margin-left: 12px;">// ${item.type}</span>
                                        </div>
                                        <div style="font-family: 'Inter', sans-serif; font-weight: 900; color: var(--teal);">
                                            x${item.amount}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                };

                html += renderSection('ELITE ADVANCEMENT // 精英化需求', elite);
                html += renderSection('SKILL MASTERY // 技能升級/專精', skill);
                html += renderSection('MODULE UPGRADE // 模組強化', module);

                if (!html) {
                    html = '<div class="loading-state" style="color: var(--muted);">目前尚無幹員在檔案中記錄此素材的需求。</div>';
                }

                content.innerHTML = html;
            }
        } catch (error) {
            content.innerHTML = '<div class="loading-state" style="color: var(--red);">ERROR: DATA TRANSMISSION INTERRUPTED</div>';
        }
    }

    window.showUsageReport = showUsageReport;

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
