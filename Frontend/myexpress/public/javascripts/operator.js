(function() {
if (typeof API_BASE === 'undefined') {
  window.API_BASE = '/api';
}

let currentOpData = null;

async function fetchApi(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`API 請求失敗: ${response.status}`);
  return response.json();
}

function getOperatorIdFromUrl() {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

async function calculateMaterialReport() {
  const id = getOperatorIdFromUrl();
  const btn = document.querySelector('#btn-calc');
  const resultContainer = document.querySelector('#calc-results');
  const toElite = document.querySelector('#calc-target-elite')?.value || 2;
  
  if (!resultContainer) return;
  
  btn.disabled = true;
  btn.innerHTML = 'ANALYZING...';
  resultContainer.innerHTML = '<div class="loading-mini" style="padding: 20px; text-align: center; color: var(--teal);">正根據目標階級聚合素材需求...</div>';

  try {
    const data = await fetchApi(`/operator/${id}/calculate-total/?to_elite=${toElite}`);
    if (data.status === 'success') {
      const list = data.total_materials_needed;
      if (!list || list.length === 0) {
        resultContainer.innerHTML = '<p class="empty-msg" style="padding: 20px; text-align: center; color: var(--muted);">查無該目標階段的養成材料數據。</p>';
      } else {
        let html = '<div class="material-report-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-top: 15px;">';
        list.forEach(item => {
          html += `
            <div class="material-card" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 10px; text-align: center;">
              <div class="m-name" style="font-size: 0.8rem; color: var(--muted); margin-bottom: 2px;">${item.material_name}</div>
              <div class="m-amount" style="font-size: 1.1rem; font-weight: 700; color: var(--teal);"><small style="font-size: 0.7em; font-weight: 400; color: var(--text);">x</small>${item.total_required}</div>
            </div>
          `;
        });
        html += '</div>';
        resultContainer.innerHTML = html;
      }
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    resultContainer.innerHTML = `<p class="error-msg" style="color: var(--red); padding: 20px; text-align: center;">計算出錯: ${error.message}</p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'UPDATE MATERIAL REPORT';
  }
}

window.calculateMaterialReport = calculateMaterialReport;

function updateStatsDisplay() {
    const elite = parseInt(document.querySelector('#select-elite').value);
    const level = parseInt(document.querySelector('#select-level').value);
    
    // 從 all_stats 找相符的
    const stats = currentOpData.all_stats.find(s => s.elite === elite && s.level === level);
    
    const statsGrid = document.querySelector('#stats-grid');
    if (!statsGrid) return;

    if (!stats) {
        statsGrid.innerHTML = '<div style="grid-column: span 4; text-align: center; color: var(--muted); padding: 20px;">資料庫尚無此等級之數據紀錄</div>';
        return;
    }

    const fields = [
        { label: 'HP', val: stats.hp },
        { label: 'ATK', val: stats.atk },
        { label: 'DEF', val: stats.def },
        { label: 'RES', val: stats.res },
        { label: 'COST', val: stats.cost },
        { label: 'BLOCK', val: stats.block },
        { label: 'REDEPLOY', val: stats.redeploy ? stats.redeploy + 's' : '--' },
        { label: 'ATK SPD', val: stats.atk_spd ? stats.atk_spd + 's' : '--' }
    ];

    statsGrid.innerHTML = fields.map(f => `
        <div class="stat-box">
            <label>${f.label}</label>
            <span>${f.val || '--'}</span>
        </div>
    `).join('');
}

window.updateStatsDisplay = updateStatsDisplay;

function renderDetail(data) {
  currentOpData = data.data;
  const op = currentOpData;
  const stats = op.stats || {};
  const profile = op.profile || {};
  const rarityStr = '★'.repeat(op.rarity);

  // 獲取所有不重複的精英階段
  const availableElites = [...new Set(op.all_stats.map(s => s.elite))].sort((a,b)=>a-b);
  const defaultElite = stats.elite || 0;
  const defaultLevel = stats.level || 1;

  const container = document.querySelector('#detail-container');
  if (!container) return;

  container.innerHTML = `
    <div class="operator-profile">
      <section class="section-portrait section-panel">
        <div class="portrait-placeholder">
          <div class="p-text">PERSONNEL FILE</div>
          <div class="p-sub">ARCHIVE DATA #RI-${op.id}</div>
        </div>
        <div class="rarity-badge">${rarityStr}</div>
      </section>

      <div class="profile-info-grid">
        <section class="section-basic section-panel">
          <h1 class="op-name" style="font-size: 2.8rem; margin: 0 0 16px; font-weight: 800;">${op.name} <span class="op-id" style="color: var(--teal); font-size: 1rem; margin-left: 12px; font-weight: 500;">// PERSONNEL ID/${op.id}</span></h1>
          <div class="basic-tags" style="display: flex; gap: 12px; margin-bottom: 24px;">
            <span class="tag tag-class" style="background: var(--teal); color: #000; padding: 6px 16px; font-weight: 800; font-size: 0.85rem;">${op.class}</span>
            <span class="tag tag-branch" style="border: 1px solid var(--border); padding: 6px 16px; font-size: 0.85rem; font-weight: 700;">${op.branch}</span>
            <span class="tag tag-meta" style="color: var(--muted); font-size: 0.85rem; padding-top: 6px; font-weight: 700;">${op.position} // ${op.sex}</span>
          </div>
          <div class="op-tags" style="display: flex; flex-wrap: wrap; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
            ${op.tags.map(t => `<span class="tag-item" style="font-size: 0.8rem; color: var(--muted); letter-spacing: 0.05em;"># ${t}</span>`).join('')}
          </div>
        </section>

        <section class="section-stats section-panel">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 12px;">
            <h3 style="margin: 0; font-size: 0.9rem; color: var(--teal); font-weight: 800; letter-spacing: 0.1em;">COMBAT ATTRIBUTES</h3>
            <div style="display: flex; gap: 8px;">
                <select id="select-elite" onchange="updateLevelOptions(); updateStatsDisplay();" class="btn btn-outline btn-sm">
                    ${availableElites.map(e => `<option value="${e}" ${e === defaultElite ? 'selected' : ''}>ELITE ${e}</option>`).join('')}
                </select>
                <select id="select-level" onchange="updateStatsDisplay()" class="btn btn-outline btn-sm">
                    <!-- Levels will be populated here -->
                </select>
            </div>
          </div>
          <div id="stats-grid" class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <!-- Stats will be injected here -->
          </div>
        </section>
      </div>

      <section class="section-lore section-panel">
        <div class="lore-header" style="display: flex; gap: 48px; margin-bottom: 24px; border-bottom: 2px solid var(--border); padding-bottom: 16px;">
          <div class="meta-item"><label style="color: var(--teal); font-size: 0.8rem; font-weight: 800; margin-right: 12px; letter-spacing: 0.1em;">ILLUSTRATOR //</label> <span style="font-weight: 700;">${profile.illustrator || '--'}</span></div>
          <div class="meta-item"><label style="color: var(--teal); font-size: 0.8rem; font-weight: 800; margin-right: 12px; letter-spacing: 0.1em;">VOICE ACTOR //</label> <span style="font-weight: 700;">${profile.voice_actor || '--'}</span></div>
        </div>
        <div class="lore-content">
          <h3 style="margin-top: 0; font-size: 0.85rem; color: var(--teal); font-weight: 800; letter-spacing: 0.2em; margin-bottom: 16px;">CHARACTER DESCRIPTION // 幹員檔案描述</h3>
          <p style="color: var(--muted); font-size: 0.95rem; line-height: 2; white-space: pre-wrap; padding: 12px; background: rgba(255,255,255,0.01); border-radius: 2px;">${profile.lore || '目前尚無檔案內容。'}</p>
        </div>
      </section>

      <section class="section-skills section-panel">
        <h3 style="margin-top: 0; font-size: 0.85rem; color: var(--teal); font-weight: 800; letter-spacing: 0.2em; margin-bottom: 24px;">EQUIPPED SKILLS // 攜帶技能</h3>
        <div class="skills-list" style="display: grid; gap: 16px;">
          ${op.skills && op.skills.length > 0 ? op.skills.map(s => `
            <div class="skill-item" style="display: grid; grid-template-columns: 60px 1fr; gap: 20px; background: rgba(255,255,255,0.02); padding: 16px; border: 1px solid rgba(255,255,255,0.05);">
              <div class="s-icon" style="width: 60px; height: 60px; background: var(--border); border: 2px solid var(--border);"></div>
              <div class="s-info">
                <h4 style="margin: 0 0 8px; color: var(--teal); font-size: 1.1rem; font-weight: 800;">${s.name}</h4>
                <p style="margin: 0; font-size: 0.85rem; color: var(--muted); line-height: 1.6;">${s.description || '無詳細描述。'}</p>
              </div>
            </div>
          `).join('') : '<p class="empty-msg" style="color: var(--muted); font-size: 0.9rem;">查無技能資料。</p>'}
        </div>
      </section>

      <section class="section-modules section-panel">
        <h3 style="margin-top: 0; font-size: 0.85rem; color: var(--teal); font-weight: 800; letter-spacing: 0.2em; margin-bottom: 24px;">OPERATOR MODULES // 專屬模組詳情</h3>
        <div class="modules-list" style="display: grid; gap: 16px;">
          ${op.modules && op.modules.length > 0 ? op.modules.map(m => `
            <div class="module-item" style="display: grid; grid-template-columns: 60px 1fr; gap: 20px; background: rgba(255,255,255,0.02); padding: 16px; border: 1px solid rgba(255,255,255,0.05);">
              <div class="m-type" style="font-size: 1.5rem; font-weight: 900; color: var(--border); display: flex; align-items: center; justify-content: center; border: 3px solid var(--border); height: 60px;">${m.type}</div>
              <div class="m-info">
                <div class="m-mission" style="font-size: 0.85rem; color: var(--text);"><strong style="color: var(--teal); margin-right: 12px;">UNLOCK MISSION //</strong> ${m.mission || '無'}</div>
              </div>
            </div>
          `).join('') : '<p class="empty-msg" style="color: var(--muted); font-size: 0.9rem;">該幹員尚無可用模組。</p>'}
        </div>
      </section>

      <section class="section-calculator section-panel" style="border: 2px solid var(--teal); background: rgba(41, 182, 246, 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div>
              <h3 style="margin: 0; color: var(--teal); font-weight: 900; letter-spacing: 0.1em; font-size: 1.2rem;">CULTIVATION CALCULATOR // 養成計算</h3>
              <p style="margin: 6px 0 0; font-size: 0.8rem; color: var(--muted); letter-spacing: 0.05em;">Calculate materials required to reach the target stage. // 按需計算晉升物資</p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <label style="font-size: 0.8rem; font-weight: 800; letter-spacing: 0.1em;">TARGET STAGE:</label>
                <select id="calc-target-elite" class="btn btn-outline btn-sm">
                    <option value="1">ELITE 1</option>
                    <option value="2" selected>ELITE 2</option>
                </select>
            </div>
        </div>
        <div class="calc-container">
          <button class="btn btn-teal btn-block" id="btn-calc" onclick="calculateMaterialReport()">
            GENERATE TARGET MATERIAL REPORT
          </button>
          <div id="calc-results" class="calc-results-area">
             <!-- Results injected here -->
          </div>
        </div>
      </section>
    </div>
  `;

  updateLevelOptions();
  updateStatsDisplay();
}

function updateLevelOptions() {
    const eliteSelect = document.querySelector('#select-elite');
    const levelSelect = document.querySelector('#select-level');
    if (!eliteSelect || !levelSelect) return;

    const elite = parseInt(eliteSelect.value);
    const levels = currentOpData.all_stats
        .filter(s => s.elite === elite)
        .map(s => s.level)
        .sort((a,b)=>a-b);

    levelSelect.innerHTML = levels.map(l => `<option value="${l}">${l}</option>`).join('');
}

window.updateLevelOptions = updateLevelOptions;

async function init() {
  const id = getOperatorIdFromUrl();
  const container = document.querySelector('#detail-container');
  if (!id) {
    if(container) container.innerHTML = '<div class="loading-state">無效的幹員 ID</div>';
    return;
  }

  try {
    const data = await fetchApi(`/operator/${id}/detail/`);
    if (data.status === 'success') {
      renderDetail(data);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('[PRTS] 檔案讀取失敗:', error);
    if (container) {
      container.innerHTML = `<div class="loading-state" style="color: var(--red);">檔案加載失敗: ${error.message}</div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);

})();
