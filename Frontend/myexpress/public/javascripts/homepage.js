(function() {
    // ==========================================
    // 羅德島終端機 - 核心資料鏈接模組
    // ==========================================
    const API_BASE = '/api';

    const elements = {
      // 基礎數據 (從 API 抓取並填入對應位置)
      operatorCount: document.querySelector('.event-meta .count'),
      briefing: document.querySelector('.briefing-box p'),
      
      // 搜尋系統
      searchInput: document.querySelector('.header-search input'),
      
      // 內容列表
      guideGrid: document.querySelector('.guide-grid'),
      wideGuide: document.querySelector('.wide-guide'),
      operatorsList: document.querySelector('.operators-list'),
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
      try {
        // 1. 獲取幹員與關卡基礎資料
        const [operatorsPayload, stagesPayload] = await Promise.all([
          fetchApi('/operators/list/'),
          fetchApi('/stages/')
        ]);

        const operators = unwrapList(operatorsPayload);
        const stages = unwrapList(stagesPayload);

        // 2. 更新儀表板數據
        if (elements.operatorCount) elements.operatorCount.textContent = operators.length;
        if (elements.briefing) {
            elements.briefing.innerHTML = `正在連線至羅德島數據庫...<br>當前已載入 ${operators.length} 名幹員檔案與 ${stages.length} 個作戰區域數據。`;
        }

        // 3. 渲染最新幹員 (取前 3 個以符合網格)
        if (elements.operatorsList) {
            elements.operatorsList.innerHTML = operators.slice(0, 3).map(op => `
                <div class="op-card" onclick="location.href='/operator/${op.operator_id}'" style="cursor:pointer">
                  <div class="op-thumb">
                    ${op.name[0]}
                    <div style="position:absolute; bottom:0; width:100%; height:4px; background:var(--teal); opacity:0.3"></div>
                  </div>
                  <div class="op-tag">${op.class.toUpperCase()} // PERSONNEL</div>
                  <p>${op.name}</p>
                </div>
            `).join('');
        }

      } catch (error) {
        console.error('[PRTS] 首頁數據加載失敗:', error);
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadHomepageData();
        
        // 搜尋框監聽
        elements.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query) location.href = `/operators?search=${encodeURIComponent(query)}`;
            }
        });
    });
})();
