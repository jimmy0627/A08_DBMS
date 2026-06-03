const API_BASE = '/api';

// 狀態管理：儲存所有資料與當前篩選條件
const state = {
  allData: [],          // 原始資料備份
  searchQuery: '',      // 搜尋關鍵字
  filterClass: 'all',   // 目前篩選的職業
  sortKey: 'rarity',    // 排序的基準欄位
  sortOrder: 'desc'     // 排序方向：'desc' 降冪, 'asc' 升冪
};

const elements = {
  listContainer: document.querySelector('#operators-list-container'),
  searchInput: document.querySelector('#global-search'),
  
  btnFilter: document.querySelector('#btn-filter'),
  menuFilter: document.querySelector('#menu-filter'),
  btnSort: document.querySelector('#btn-sort'),
  menuSort: document.querySelector('#menu-sort')
};

// --- 工具函數 ---
const unwrapList = (payload) => {
  if (Array.isArray(payload?.operators)) return payload.operators;
  if (Array.isArray(payload?.data)) return payload.data;
  return Array.isArray(payload) ? payload : [];
};

const fetchApi = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`API 請求失敗: ${response.status}`);
  return response.json();
};

// --- 核心邏輯：資料處理與渲染 ---
function applyFiltersAndSort() {
  // 1. 執行過濾 (搜尋 + 職業篩選)
  let result = state.allData.filter(op => {
    // 搜尋匹配 (名稱 或 英文代號)
    const q = state.searchQuery;
    const nameMatch = (op.name || '').toLowerCase().includes(q) || 
                      (op.en_name || '').toLowerCase().includes(q);
    
    // 職業匹配
    const classMatch = state.filterClass === 'all' || op.class === state.filterClass;
    
    return (!q || nameMatch) && classMatch;
  });

  // 2. 執行排序
  result.sort((a, b) => {
    // 將抓出來的欄位轉為數字，如果無法轉換（如預設值 '--'）則視為 0
    let valA = parseFloat(a[state.sortKey]) || 0;
    let valB = parseFloat(b[state.sortKey]) || 0;

    if (valA < valB) return state.sortOrder === 'desc' ? 1 : -1;
    if (valA > valB) return state.sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  // 3. 將處理好的資料送去渲染
  renderList(result);
}

// 根據資料庫回傳的內容，動態生成「職業篩選」的選單
function generateClassFilterMenu() {
  if (!elements.menuFilter) return;

  // 使用 Set 取出不重複的職業名稱
  const uniqueClasses = [...new Set(state.allData.map(op => op.class).filter(Boolean))];
  
  let html = `<button class="dropdown-item active" data-class="all">全部職業</button>`;
  uniqueClasses.forEach(c => {
    html += `<button class="dropdown-item" data-class="${c}">${c}</button>`;
  });
  
  elements.menuFilter.innerHTML = html;
}

// 綁定所有點擊與輸入事件
function setupEventListeners() {
  // 搜尋框輸入
  elements.searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    applyFiltersAndSort();
  });

  // 開關職業選單
  elements.btnFilter?.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.menuFilter.classList.toggle('show');
    elements.menuSort.classList.remove('show');
  });

  // 開關排序選單
  elements.btnSort?.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.menuSort.classList.toggle('show');
    elements.menuFilter.classList.remove('show');
  });

  // 點擊畫面其他地方自動關閉選單
  document.addEventListener('click', () => {
    elements.menuFilter?.classList.remove('show');
    elements.menuSort?.classList.remove('show');
  });

  // 監聽「職業篩選」選單點擊
  elements.menuFilter?.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;

    elements.menuFilter.querySelectorAll('.dropdown-item').forEach(btn => btn.classList.remove('active'));
    item.classList.add('active');

    state.filterClass = item.dataset.class;
    elements.btnFilter.innerHTML = `<span class="icon">▽</span> ${item.textContent}`;
    
    applyFiltersAndSort();
  });

  // 監聽「數值排序」選單點擊
  elements.menuSort?.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;

    elements.menuSort.querySelectorAll('.dropdown-item').forEach(btn => btn.classList.remove('active'));
    item.classList.add('active');

    state.sortKey = item.dataset.sort;
    state.sortOrder = item.dataset.order;
    
    // 只取標題前半段 (例如: "攻擊力 (高 ➔ 低)" 變成 "攻擊力排序")
    const titleText = item.textContent.split(' ')[0];
    elements.btnSort.innerHTML = `<span class="icon">⇅</span> ${titleText}排序`;
    
    applyFiltersAndSort();
  });
}

function renderList(operators) {
  if (!elements.listContainer) return;

  if (operators.length === 0) {
    elements.listContainer.innerHTML = '<div class="loading-state">無符合條件的數據</div>';
    return;
  }

  elements.listContainer.innerHTML = operators.map(op => {
    const id = op.operator_id || '--';
    const name = op.name || 'UNKNOWN';
    const oClass = op.class || '未分類';
    const oBranch = op.branch || '--';
    const positionAndSex = `${op.position || '未知'} / ${op.sex || '未知'}`;
    const enName = op.en_name || 'OPERATOR'; 
    const rarityNum = parseInt(op.rarity) || 1; 
    const rarityStr = '★'.repeat(rarityNum);
    const hp = op.hp || '--';
    const atk = op.atk || '--';
    const def = op.def || '--';
    const res = op.res || '--';
    const cost = op.cost || '--';
    const block = op.block || '--';
    const redeploy = op.redeploy ? `${op.redeploy}s` : '--';
    const atkSpd = op.atk_spd ? `${op.atk_spd}s` : '--';

    return `
      <div class="operator-row">
        <div class="col-portrait">
           <div class="portrait-box"></div>
           <div class="rarity-stars">${rarityStr}</div>
        </div>
        <div class="col-info">
          <div class="name-group">
            <h2 class="name-tw">${name}</h2>
            <span class="name-en">${enName.toUpperCase()}</span>
          </div>
          <div class="tag-group">
            <span class="tag-class">${oClass}</span>
            <span class="tag-branch">${oBranch}</span>
            <span class="meta-info">${positionAndSex}</span>
          </div>
        </div>
        <div class="col-stats">
          <div class="stat-item"><span class="label">♡ HP</span><span class="value">${hp}</span></div>
          <div class="stat-item"><span class="label">☼ ATK</span><span class="value">${atk}</span></div>
          <div class="stat-item"><span class="label">⛨ DEF</span><span class="value">${def}</span></div>
          <div class="stat-item"><span class="label">〇 RES</span><span class="value">${res}</span></div>
          <div class="stat-item"><span class="label">⚡ COST</span><span class="value">${cost}</span></div>
          <div class="stat-item"><span class="label">⚲ 阻擋</span><span class="value">${block}</span></div>
          <div class="stat-item"><span class="label">◷ 再部署</span><span class="value">${redeploy}</span></div>
          <div class="stat-item"><span class="label">⌁ 攻速</span><span class="value">${atkSpd}</span></div>
        </div>
        <div class="col-action">
          <a href="/operator/${id}" class="btn-details">
            <span class="arrow">〉</span>
            <span class="text">DETAILS</span>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// 啟動加載
async function init() {
  try {
    const payload = await fetchApi('/operators/list/');
    // 把資料備份到全域狀態裡
    state.allData = unwrapList(payload);
    
    // 初始化 UI 元件
    generateClassFilterMenu();
    setupEventListeners();
    
    // 初次呼叫，執行預設渲染 (包含預設的星級降冪排序)
    applyFiltersAndSort();

  } catch (error) {
    console.error('[PRTS] 數據讀取失敗:', error);
    if (elements.listContainer) {
      elements.listContainer.innerHTML = `<div class="loading-state" style="color: #D32F2F;">數據加載失敗: ${error.message}</div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);