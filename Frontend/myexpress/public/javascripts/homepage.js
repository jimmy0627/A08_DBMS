(function() {
    // ==========================================
    // 羅德島終端機 - 核心資料鏈接模組
    // ==========================================
    const API_BASE = '/api';

    const elements = {
      // 儀表板
      operatorCount: document.querySelector('.event-meta .count'),
      briefing: document.querySelector('.briefing-box p'),
      eventSection: document.querySelector('#event-section'),
      
      // 搜尋系統
      searchInput: document.querySelector('.header-search input'),
      
      // 內容列表
      guideGrid: document.querySelector('#guide-grid'),
      featuredGuide: document.querySelector('#featured-guide'),
      operatorsList: document.querySelector('#operators-list'),
    };

    // --- 工具函數 ---

    const unwrapList = (payload, keys = ['data', 'stages', 'results', 'operators', 'guides']) => {
      for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
      }
      return Array.isArray(payload) ? payload : [];
    };

    const pickValue = (item, keys, fallback = '') => {
      for (const key of keys) {
        if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== '') return item[key];
      }
      return fallback;
    };

    const fetchApi = async (path) => {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`API 請求失敗: ${response.status}`);
      return response.json();
    };

    // --- 核心邏輯 ---

    async function loadHomepageData() {
      // Identity Check for Greeting
      const user = auth.getUser();
      const welcomeText = document.getElementById('welcome-text');
      if (user && welcomeText) {
          welcomeText.textContent = `歡迎歸來，${user.nickname} 博士`;
      }

      try {
        // 1. 獲取核心資料與全局統計
        const [operatorsPayload, stagesPayload, statsPayload] = await Promise.all([
          fetchApi('/operators/list/'),
          fetchApi('/stages/'),
          fetchApi('/stats/')
        ]);

        const operators = unwrapList(operatorsPayload);
        const stages = unwrapList(stagesPayload);
        const stats = statsPayload.status === 'success' ? statsPayload.data : { total_operators: 0, total_materials: 0, total_guides: 0, total_stages: 0 };

        // 2. 更新簡報
        if (elements.briefing) {
            elements.briefing.innerHTML = `正在連線至羅德島數據庫...<br>
            當前已載入 <span style="color:var(--teal); font-weight:800">${stats.total_operators}</span> 名幹員檔案、
            <span style="color:var(--teal); font-weight:800">${stats.total_materials}</span> 種物資數據與 
            <span style="color:var(--teal); font-weight:800">${stats.total_guides}</span> 份戰術指南。`;
        }

        // 3. 渲染「數據庫總覽」看板
        if (elements.eventSection) {
            elements.eventSection.innerHTML = `
                <div class="event-card">
                  <div class="event-meta">
                    <span class="count">${stats.total_operators}</span>
                    <p>已載入幹員 / OPS</p>
                    <span class="status-badge" style="background:var(--teal); color:#000;">SYNC_OK</span>
                  </div>
                  <div class="event-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h2 style="color:var(--teal); font-size: 0.9rem; margin-bottom: 12px; font-weight:900;">DATABASE OVERVIEW // 實時數據庫總覽</h2>
                        <div style="font-size: 0.8rem; color: var(--muted); line-height: 1.8;">
                             [ OPERATORS ] : ${stats.total_operators} <br>
                             [ MATERIALS ] : ${stats.total_materials} <br>
                             [ GUIDES ] : ${stats.total_guides} <br>
                             [ STAGES ] : ${stats.total_stages}
                        </div>
                    </div>
                    <div style="border-left: 1px solid var(--border); padding-left: 20px;">
                        <div style="font-size: 0.7rem; color: var(--teal); font-weight: 800; margin-bottom: 8px;">PRTS_SYSTEM_INFO</div>
                        <p class="event-desc" style="font-size: 0.75rem;">數據庫狀態穩定。所有核心模塊已掛載，當前系統正在監控 ${stats.total_stages} 個作戰區域的戰術變化。</p>
                    </div>
                  </div>
                </div>
            `;
        }

        // 4. 渲染「最新幹員」 (取前 6 個以增加豐富度)
        if (elements.operatorsList) {
            elements.operatorsList.innerHTML = operators.slice(0, 6).map(op => {
                const avatarUrl = op.avatar_url || `/static/images/avatars/default.png`;
                return `
                <div class="op-card" onclick="location.href='/operator/${op.operator_id}'" style="cursor:pointer">
                  <div class="op-thumb" style="background-image: url('${avatarUrl}'); background-size: cover; display: flex; align-items: center; justify-content: center; background-position: top center;">
                    <div style="position:absolute; bottom:0; width:100%; height:4px; background:var(--teal); opacity:0.8"></div>
                  </div>
                  <div class="op-tag">${(op.class || 'UNCODED').toUpperCase()} // PERSONNEL</div>
                  <p>${op.name}</p>
                </div>
            `;
            }).join('');
        }

        // 5. 渲染「功能導覽」
        if (elements.guideGrid) {
            elements.guideGrid.innerHTML = `
                <article class="guide-card panel" onclick="location.href='/stages_list.html'" style="cursor:pointer">
                  <div class="card-header">作戰資料庫 // STAGES</div>
                  <h3>關卡詳細介紹</h3>
                  <p>獲取各區域作戰目標、掉落物資與能源消耗數據。</p>
                  <span class="arrow">›</span>
                </article>
                <article class="guide-card panel" onclick="location.href='/guides_list.html'" style="cursor:pointer">
                  <div class="card-header">戰術指南 // GUIDES</div>
                  <h3>玩家攻略列表</h3>
                  <p>查閱精英博士撰寫的作戰日誌，學習核心機制與應對方案。</p>
                  <span class="arrow">›</span>
                </article>
            `;
        }

        if (elements.featuredGuide) {
            elements.featuredGuide.innerHTML = `
                <div class="guide-info">
                  <p class="card-header">系統公告 // SYSTEM NOTIFICATION</p>
                  <h3>羅德島數據庫同步完成</h3>
                  <p>當前資料庫版本: v2.0.4.5 // 伺服器狀態: 穩定</p>
                </div>
            `;
        }

      } catch (error) {
        console.error('[PRTS] 首頁數據加載失敗:', error);
        if (elements.briefing) elements.briefing.innerHTML = '<span style="color:var(--red);">系統掛載失敗: 無法存取遠端資料庫</span>';
      }
    }

    async function checkSystemConnection() {
      const statusBox = document.getElementById('connection-status');
      if (!statusBox) return;

      const statusText = statusBox.querySelector('.status-text');
      const connText = statusBox.querySelector('.conn-text');

      try {
        const response = await fetch(`${API_BASE}/health/`);
        if (response.ok) {
          statusText.textContent = 'ONLINE';
          statusText.style.color = 'var(--teal)';
          statusText.classList.remove('blink-red');

          connText.textContent = 'STABLE';
          connText.style.color = 'var(--teal)';
          connText.classList.remove('blink-red');
        } else {
          throw new Error('Server issues');
        }
      } catch (err) {
        statusText.textContent = 'OFFLINE';
        statusText.style.color = '#D32F2F';
        statusText.classList.add('blink-red');

        connText.textContent = 'LOST';
        connText.style.color = '#D32F2F';
        connText.classList.add('blink-red');
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadHomepageData();
        checkSystemConnection();
        setInterval(checkSystemConnection, 15000);
    });
})();
