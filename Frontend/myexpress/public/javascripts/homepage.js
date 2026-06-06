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
          fetchApi('/stats/global/')
        ]);

        const operators = unwrapList(operatorsPayload);
        const stages = unwrapList(stagesPayload);
        const stats = statsPayload.status === 'success' ? statsPayload.counts : { operators: 0, materials: 0, guides: 0 };

        // 2. 更新簡報
        if (elements.briefing) {
            elements.briefing.innerHTML = `正在連線至羅德島數據庫...<br>
            當前已載入 <span style="color:var(--teal); font-weight:800">${stats.operators}</span> 名幹員檔案、
            <span style="color:var(--teal); font-weight:800">${stats.materials}</span> 種物資數據與 
            <span style="color:var(--teal); font-weight:800">${stats.guides}</span> 份戰術指南。`;
        }

        // 3. 渲染「活動/重點作戰」看板 (取最後一個關卡作為當前活動)
        if (elements.eventSection && stages.length > 0) {
            const currentStage = stages[stages.length - 1];
            elements.eventSection.innerHTML = `
                <div class="event-card" onclick="location.href='/operators?search=${currentStage.stage_id}'" style="cursor:pointer">
                  <div class="event-meta">
                    <span class="count">${stats.operators}</span>
                    <p>已載入幹員 / OPS</p>
                    <span class="status-badge" style="background:var(--teal); color:#000;">SYSTEM ONLINE</span>
                  </div>
                  <div class="event-content">
                    <h2>${currentStage.stage_id} // 戰術目標</h2>
                    <p class="event-desc">${currentStage.description || '點擊查看推薦幹員及掉落數據'} <br>目前共有 ${stats.guides} 篇相關攻略。</p>
                  </div>
                </div>
            `;
        }

        // 4. 渲染「最新幹員」 (取前 6 個以增加豐富度)
        if (elements.operatorsList) {
            elements.operatorsList.innerHTML = operators.slice(0, 6).map(op => `
                <div class="op-card" onclick="location.href='/operator/${op.operator_id}'" style="cursor:pointer">
                  <div class="op-thumb" style="background-image: url('/static/images/operators/${op.operator_id}.png'); background-size: cover; display: flex; align-items: center; justify-content: center; background-position: top center;">
                    <div style="position:absolute; bottom:0; width:100%; height:4px; background:var(--teal); opacity:0.8"></div>
                  </div>
                  <div class="op-tag">${(op.class || 'UNCODED').toUpperCase()} // PERSONNEL</div>
                  <p>${op.name}</p>
                </div>
            `).join('');
        }

        // 5. 渲染「攻略推薦」 (從關卡中抽樣顯示)
        if (elements.guideGrid) {
            const sampleStages = stages.slice(0, 2);
            elements.guideGrid.innerHTML = sampleStages.map(st => `
                <article class="guide-card panel" onclick="location.href='/operators?search=${st.stage_id}'" style="cursor:pointer">
                  <div class="card-header">關卡 // STAGE</div>
                  <h3>${st.stage_id}</h3>
                  <p>目標地區: ${st.map_name || '未知區域'}</p>
                  <span class="arrow">›</span>
                </article>
            `).join('');
        }

        if (elements.featuredGuide) {
            elements.featuredGuide.innerHTML = `
                <div class="guide-info">
                  <p class="card-header">系統公告 // SYSTEM NOTIFICATION</p>
                  <h3>羅德島數據庫同步完成</h3>
                  <p>當前資料庫版本: v2.0.4.5 // 伺服器狀態: 穩定</p>
                </div>
                <button class="btn-read-more" onclick="location.href='/operators'">READ ALL FILES</button>
            `;
        }

      } catch (error) {
        console.error('[PRTS] 首頁數據加載失敗:', error);
        if (elements.briefing) elements.briefing.innerHTML = '<span style="color:var(--red);">系統掛載失敗: 無法存取遠端資料庫</span>';
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadHomepageData();
    });
})();
