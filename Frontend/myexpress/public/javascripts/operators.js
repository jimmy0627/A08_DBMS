(function() {
    const API_BASE = '/api';

    const state = {
        allData: [],
        searchQuery: '',
        filterClass: 'all',
        sortKey: 'rarity',
        sortOrder: 'desc',
        eliteStage: 0
    };

    let elements = {};

    const unwrapList = (payload) => {
        if (Array.isArray(payload?.operators)) return payload.operators;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.results)) return payload.results;
        return Array.isArray(payload) ? payload : [];
    };

    const fetchApi = async (path) => {
        const response = await fetch(`${API_BASE}${path}`, {
            headers: { accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`API 請求失敗: ${response.status}`);
        return response.json();
    };

    function applyFiltersAndSort() {
        let result = state.allData.filter(op => {
            const q = state.searchQuery;
            const nameMatch = (op.name || '').toLowerCase().includes(q) || 
                              (op.en_name || '').toLowerCase().includes(q);
            const classMatch = state.filterClass === 'all' || op.class === state.filterClass;
            return (!q || nameMatch) && classMatch;
        });

        result.sort((a, b) => {
            let valA, valB;
            
            // Check if we need to sort by a stat which might vary by elite stage
            const statKeys = ['hp', 'atk', 'def', 'res', 'cost', 'block', 'redeploy', 'atk_spd'];
            if (statKeys.includes(state.sortKey)) {
                // 修正：對齊 Detail 頁面，使用 all_stats 欄位
                const states = a.all_stats || a.states || [];
                const stateA = states.find(s => s.elite_stage == state.eliteStage) || a;
                const stateB = (b.all_stats || b.states || []).find(s => s.elite_stage == state.eliteStage) || b;
                
                // 根據資料庫 Schema 處理欄位映射 (優先取 max 數值作為排序基準)
                const getVal = (s, key) => {
                    if (key === 'hp') return parseFloat(s.max_hp || s.hp) || 0;
                    if (key === 'atk') return parseFloat(s.max_atk || s.atk) || 0;
                    if (key === 'def') return parseFloat(s.max_def || s.def) || 0;
                    if (key === 'res') return parseFloat(s.max_res || s.res) || 0;
                    if (key === 'block') return parseFloat(s.stop_amount || s.block) || 0;
                    if (key === 'redeploy') return parseFloat(s.deploy_cd || s.redeploy) || 0;
                    if (key === 'atk_spd') return parseFloat(s.atk_cd || s.atk_spd) || 0;
                    return parseFloat(s[key]) || 0;
                };

                valA = getVal(stateA, state.sortKey);
                valB = getVal(stateB, state.sortKey);
            } else {
                valA = parseFloat(a[state.sortKey]) || 0;
                valB = parseFloat(b[state.sortKey]) || 0;
            }

            if (valA < valB) return state.sortOrder === 'desc' ? 1 : -1;
            if (valA > valB) return state.sortOrder === 'desc' ? -1 : 1;
            return 0;
        });

        renderList(result);
    }

    function generateClassFilterMenu() {
        if (!elements.menuFilter) return;
        const uniqueClasses = [...new Set(state.allData.map(op => op.class).filter(Boolean))];
        let html = `<button class="dropdown-item active" data-class="all">全部職業</button>`;
        uniqueClasses.forEach(c => {
            html += `<button class="dropdown-item" data-class="${c}">${c}</button>`;
        });
        elements.menuFilter.innerHTML = html;
    }

    function setupEventListeners() {
        // Elite Toggle Event
        document.querySelectorAll('.btn-elite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newStage = parseInt(e.target.dataset.elite);
                state.eliteStage = newStage;
                
                // Update UI state
                document.querySelectorAll('.btn-elite').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                applyFiltersAndSort();
            });
        });

        elements.searchInput?.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim().toLowerCase();
            applyFiltersAndSort();
        });

        elements.btnFilter?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.menuFilter.classList.toggle('show');
            elements.menuSort.classList.remove('show');
        });

        elements.btnSort?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.menuSort.classList.toggle('show');
            elements.menuFilter.classList.remove('show');
        });

        document.addEventListener('click', () => {
            elements.menuFilter?.classList.remove('show');
            elements.menuSort?.classList.remove('show');
        });

        elements.menuFilter?.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (!item) return;
            elements.menuFilter.querySelectorAll('.dropdown-item').forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            state.filterClass = item.dataset.class;
            elements.btnFilter.innerHTML = `<span class="icon">▽</span> ${item.textContent}`;
            applyFiltersAndSort();
        });

        elements.menuSort?.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (!item) return;
            elements.menuSort.querySelectorAll('.dropdown-item').forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            state.sortKey = item.dataset.sort;
            state.sortOrder = item.dataset.order;
            const titleText = item.textContent.split(' ')[0];
            elements.btnSort.innerHTML = `<span class="icon">⇅</span> ${titleText}排序`;
            applyFiltersAndSort();
        });

        // 精英化切換監聽
        document.querySelector('.elite-toggle-group')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-elite');
            if (!btn) return;
            
            document.querySelectorAll('.btn-elite').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.eliteStage = parseInt(btn.dataset.elite);
            applyFiltersAndSort();
        });

        elements.listContainer?.addEventListener('click', (e) => {
        // 尋找被點擊的元素是否為 Roster 按鈕 (包含點擊到按鈕內的 span)
        const rosterBtn = e.target.closest('.btn-add-roster');
        
        if (rosterBtn) {
            // 從按鈕的 data 屬性中安全地把 ID 與名稱拿出來
            const opId = rosterBtn.dataset.id;
            const opName = rosterBtn.dataset.name;
            
            // 呼叫加入名冊的函數
            addToRoster(opId, opName);
        }
        });
    }

    function renderList(operators) {
        if (!elements.listContainer) return;

        if (operators.length === 0) {
            elements.listContainer.innerHTML = '<div class="loading-state">無符合條件的數據</div>';
            return;
        }

        const user = JSON.parse(localStorage.getItem('prts_user') || 'null');
        const uid = user ? (user.user_id || user.id) : null;

        elements.listContainer.innerHTML = operators.map(op => {
            const id = op.operator_id || op.id || '--';
            const name = op.name || 'UNKNOWN';
            const rarityNum = parseInt(op.rarity) || 1;
            const rarityStr = '★'.repeat(rarityNum);
            
            // Get current stats based on elite stage (修正使用 all_stats)
            const states = op.all_stats || op.states || [];
            let currentStats = states.find(s => s.elite_stage == state.eliteStage);
            
            // Fallback to top-level stats if nested states are not available
            if (!currentStats) {
                currentStats = op;
            }

            // Get tags for the operator
            const tags = Array.isArray(op.tags) ? op.tags : [];
            const tagHtml = tags.map(t => `<span class="tag-meta" style="border: 1px solid rgba(255,255,255,0.2); padding: 1px 6px; font-size: 0.65rem; color: var(--muted);">${t}</span>`).join('');

            let actionHtml = `
                <a href="/operator/${id}" class="btn-details">
                    <span class="arrow">〉</span>
                    <span class="text">DETAILS</span>
                </a>
            `;


            if (uid) {
                actionHtml = `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${actionHtml}
                        <button class="btn-add-roster" data-id="${id}" data-name="${name}">
                            <span class="plus">+</span> ROSTER
                        </button>
                    </div>
                `;
            }
            
            return `
                <div class="operator-row">
                    <div class="col-portrait">
                       <div class="portrait-box" style="background-image: url('/static/images/operators/${id}.png'); background-size: cover; background-position: top center; border-bottom: 2px solid var(--teal); background-color: #000;">
                         ${!id ? '?' : ''}
                       </div>
                       <div class="rarity-stars">${rarityStr}</div>
                    </div>
                    <div class="col-info">
                        <div class="name-group" style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 6px;">
                            <h2 class="name-tw" style="margin:0; font-size: 1.8rem; font-weight: 800;">${name}</h2>
                            <span class="name-en" style="font-size: 0.7rem; color: var(--muted); letter-spacing: 0.2em; font-weight: 800;">// ${op.en_name || 'UNCODED'}</span>
                        </div>
                        <div class="tag-group" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
                            <span class="tag-class" style="background: var(--teal); color: #000; padding: 2px 10px; font-weight: 800; font-size: 0.75rem;">${op.class || '未分類'}</span>
                            <span class="tag-branch" style="border: 1px solid var(--border); padding: 2px 10px; font-size: 0.75rem; color: var(--text);">${op.branch || '--'}</span>
                            <span class="meta-info" style="color: var(--muted); font-size: 0.75rem; padding-top: 2px;">${op.position || '--'} / ${op.sex || '--'}</span>
                        </div>
                        <div class="op-tags-list" style="display: flex; gap: 4px;">
                            ${tagHtml}
                        </div>
                    </div>
                    <div class="col-stats">
                        <div class="stat-item"><span class="label">♡ HP</span><span class="value">${currentStats.max_hp || currentStats.hp || '--'}</span></div>
                        <div class="stat-item"><span class="label">❂ ATK</span><span class="value">${currentStats.max_atk || currentStats.atk || '--'}</span></div>
                        <div class="stat-item"><span class="label">⛨ DEF</span><span class="value">${currentStats.max_def || currentStats.def || '--'}</span></div>
                        <div class="stat-item"><span class="label">🛡️ RES</span><span class="value">${currentStats.max_res || currentStats.res || '0'}</span></div>
                        <div class="stat-item"><span class="label">⚡ COST</span><span class="value">${currentStats.cost || '--'}</span></div>
                        <div class="stat-item"><span class="label">⚓ BLOCK</span><span class="value">${currentStats.stop_amount || currentStats.block || '--'}</span></div>
                        <div class="stat-item"><span class="label">⌛ REDEP</span><span class="value">${currentStats.deploy_cd || currentStats.redeploy || '--'}s</span></div>
                        <div class="stat-item"><span class="label">⚔️ ATK-SPD</span><span class="value">${currentStats.atk_cd || currentStats.atk_spd || '--'}s</span></div>
                    </div>
                    <div class="col-action">
                        ${actionHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    async function addToRoster(opId, opName) {
        console.log(`[PRTS] Requesting roster registration for: ${opName} (${opId})`);
        
        const user = JSON.parse(localStorage.getItem('prts_user') || 'null');
        if (!user || (!user.user_id && !user.id)) {
            alert('UNAUTHORIZED // 請先登入系統');
            return;
        }

        const uid = parseInt(user.user_id || user.id);

        try {
            const requestData = {
                user_id: uid,
                operator_id: opId
            };
            console.log(`[PRTS] Sending data:`, requestData);

            const response = await fetch(`${API_BASE}/operators/roster/add/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            if (result.status === 'success' || response.ok) {
                alert(`[羅德島人事部] 已將幹員「${opName}」的人事檔案併入庫中。`);
            } else {
                alert(result.message || '操作失敗：該檔案可能已在名冊中或權限不足');
            }
        } catch (error) {
            console.error('[PRTS] Add to roster error:', error);
            alert('COMMUNICATION ERROR // 通訊中斷，請稍後再試');
        }
    }

    // Immediately expose to window ensure accessibility for DOM events
    window.addToRoster = addToRoster;

    async function init() {
        elements = {
            listContainer: document.querySelector('#operators-list-container'),
            searchInput: document.querySelector('#global-search'),
            btnFilter: document.querySelector('#btn-filter'),
            menuFilter: document.querySelector('#menu-filter'),
            btnSort: document.querySelector('#btn-sort'),
            menuSort: document.querySelector('#menu-sort')
        };

        try {
            const payload = await fetchApi('/operators/list/');
            state.allData = unwrapList(payload);
            generateClassFilterMenu();
            setupEventListeners();
            applyFiltersAndSort();
        } catch (error) {
            console.error('[PRTS] 數據讀取失敗:', error);
            if (elements.listContainer) {
                elements.listContainer.innerHTML = `<div class="loading-state" style="color: #D32F2F;">數據加載失敗: ${error.message}</div>`;
            }
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
