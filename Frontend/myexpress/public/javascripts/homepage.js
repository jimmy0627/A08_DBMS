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
      fetchApi('/stages/'),
    ]);

    const operators = unwrapList(operatorsPayload);
    const stages = unwrapList(stagesPayload);

    // 2. 更新 Hero 數據 (以幹員數量展示活動倒數旁的數字作為示例)
    if (elements.operatorCount) {
      elements.operatorCount.textContent = operators.length || '21';
    }

    // 3. 更新簡報資訊 (展示 API 目前狀態)
    if (elements.briefing) {
      elements.briefing.innerHTML = `正在連線至羅德島數據庫...<br>
      目前已索引 <strong>${operators.length}</strong> 位幹員與 <strong>${stages.length}</strong> 個作戰關卡。`;
    }

    // 4. 動態生成指南卡片 (填入 .guide-grid)
    if (elements.guideGrid && stages.length > 0) {
      const topStages = stages.slice(0, 2);
      const guideCards = [];
      
      for (const [index, stage] of topStages.entries()) {
        const stageId = pickValue(stage, ['id', 'stage_id']);
        const stageName = pickValue(stage, ['name', 'stage_name']);
        
        guideCards.push(`
          <article class="guide-card panel">
            <div class="card-header">${index === 0 ? '編隊' : '幹員'} // GUIDE</div>
            <h3>${stageName}</h3>
            <p>理智消耗: ${stage.cost || 'N/A'}</p>
            <span class="arrow">›</span>
          </article>
        `);
      }
      elements.guideGrid.innerHTML = guideCards.join('');
    }

    // 5. 更新大版面指南 (使用最新的關卡或攻略)
    if (elements.wideGuide && stages.length > 2) {
      const mainStage = stages[2];
      elements.wideGuide.querySelector('h3').textContent = mainStage.name || '生息演算';
      elements.wideGuide.querySelector('p').textContent = `消耗理智: ${mainStage.cost} // 推薦等級: ${mainStage.level || 'E2-20'}`;
    }

    // 6. 更新幹員列表 (Breaking News 區塊)
    if (elements.operatorsList && operators.length > 0) {
      const recentOps = operators.slice(0, 3);
      elements.operatorsList.innerHTML = recentOps.map((op, i) => `
        <div class="op-card">
          <div class="op-thumb" style="background-image: url('${op.image || ''}'); background-size: cover;"></div>
          <div class="op-tag ${i === 0 ? 'birthday' : ''}">${i === 0 ? '今日生日' : '近期新增'}</div>
          <p>${op.name}</p>
        </div>
      `).join('');
    }

  } catch (error) {
    console.error('[PRTS] 終端機連線失敗:', error);
    if (elements.briefing) {
      elements.briefing.innerHTML = `<span style="color: #D32F2F;">[ALERT] 無法取得資料庫授權。</span><br>請檢查後端服務連線狀態。`;
    }
  }
}

// 系統啟動
document.addEventListener('DOMContentLoaded', loadHomepageData);