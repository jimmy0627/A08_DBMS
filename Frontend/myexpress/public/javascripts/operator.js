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
  const lastPart = pathParts[pathParts.length - 1];
  // 如果路徑結尾是 operator.html，說明是直接存取靜態檔案而非透過 /operator/:id 路由
  if (lastPart === 'operator.html' || !lastPart) {
      return new URLSearchParams(window.location.search).get('id');
  }
  return lastPart;
}

async function calculateMaterialReport() {
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

  const getIcon = (name, url) => {
    if (url) return url;
    const fileName = mapping[name] || `${name}.png`;
    return `/static/images/materials/${fileName}`;
  };

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
          const iconPath = getIcon(item.material_name, item.icon_url);
          
          html += `
            <div class="material-card" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 10px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div class="m-icon" style="width: 48px; height: 48px; background: #000; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${iconPath}" alt="${item.material_name}" onerror="this.parentElement.innerHTML='<span style=\'color:var(--muted); font-size:0.7rem;\'>${item.material_name[0]}</span>'" style="width: 100%; height: 100%; object-fit: contain;">
              </div>
              <div>
                <div class="m-name" style="font-size: 0.8rem; color: var(--muted); margin-bottom: 2px;">${item.material_name}</div>
                <div class="m-amount" style="font-size: 1.1rem; font-weight: 700; color: var(--teal);"><small style="font-size: 0.7em; font-weight: 400; color: var(--text);">x</small>${item.total_required}</div>
              </div>
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
    const eliteSelect = document.querySelector('#select-elite');
    const levelInput = document.querySelector('#input-level');
    if (!eliteSelect || !levelInput) return;

    const elite = parseInt(eliteSelect.value);
    const level = parseInt(levelInput.value);
    
    // 找出該精英階段的範圍數據
    const stageData = currentOpData.all_stats.find(s => s.elite_stage === elite);
    
    const statsGrid = document.querySelector('#stats-grid');
    if (!statsGrid) return;

    if (!stageData) {
        statsGrid.innerHTML = '<div style="grid-column: span 4; text-align: center; color: var(--muted); padding: 20px;">資料庫尚無此等級之數據紀錄</div>';
        return;
    }

    // 線性插值計算公式: 當前值 = 初始值 + (滿級值 - 初始值) * (當前等級 - 1) / (該階段滿級 - 1)
    const calculate = (min, max, maxLvl) => {
        const minVal = parseFloat(min);
        const maxVal = parseFloat(max);
        if (isNaN(minVal) || isNaN(maxVal)) return '--';
        if (maxLvl <= 1 || level <= 1) return Math.round(minVal);
        if (level >= maxLvl) return Math.round(maxVal);
        const ratio = (level - 1) / (maxLvl - 1);
        return Math.round(minVal + (maxVal - minVal) * ratio);
    };

    const stats = {
        hp: calculate(stageData.hp_range?.min, stageData.hp_range?.max, stageData.max_level),
        atk: calculate(stageData.atk_range?.min, stageData.atk_range?.max, stageData.max_level),
        def: calculate(stageData.def_range?.min, stageData.def_range?.max, stageData.max_level),
        res: calculate(stageData.res_range?.min ?? stageData.res, stageData.res_range?.max ?? stageData.res, stageData.max_level),
        // 修正：從 stageData 獲取該階段對應的固定數值 (cost, block, redeploy, atk_spd)
        // 並優先使用正確的後端欄位名稱 (stop_amount/block, deploy_cd, atk_cd)
        cost: stageData.cost ?? currentOpData.cost ?? '--',
        block: stageData.block ?? currentOpData.block ?? '--',
        redeploy: stageData.redeploy ?? currentOpData.redeploy ?? '--',
        atk_spd: stageData.atk_spd ?? currentOpData.atk_spd ?? '--'
    };

    const fields = [
        { label: '♡ HP', val: stats.hp },
        { label: '❂ ATK', val: stats.atk },
        { label: '⛨ DEF', val: stats.def },
        { label: '🛡️ RES', val: stats.res },
        { label: '⚡ COST', val: stats.cost },
        { label: '⚓ BLOCK', val: stats.block },
        { label: '⌛ RE-DEP', val: stats.redeploy ? stats.redeploy + (typeof stats.redeploy === 'number' ? 's' : '') : '--' },
        { label: '⚔️ ATK-SPD', val: stats.atk_spd ? stats.atk_spd + (typeof stats.atk_spd === 'number' ? 's' : '') : '--' }
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

  // 獲取所有不重複的精英階段 (修復：後端欄位為 elite_stage)
  const availableElites = [...new Set(op.all_stats.map(s => s.elite_stage))].sort((a,b)=>a-b);
  const defaultElite = stats.elite || 0;
  const defaultLevel = stats.level || 1;

  const container = document.querySelector('#detail-container');
  if (!container) return;

  // 補齊圖片路徑：優先使用資料庫欄位，若無則嘗試預設路徑
  const portraitUrl = op.portrait_url || `/static/images/portraits/${op.id}.png`;
  const avatarUrl = op.avatar_url || `/static/images/avatars/${op.id}.png`;

  container.innerHTML = `
    <div class="operator-profile">
      <section class="section-portrait section-panel" style="position: relative; height: 500px; overflow: hidden; background: #000; border: 1px solid var(--border);">
        <div class="portrait-box" id="portrait-img" style="width: 100%; height: 100%; background-image: url('${portraitUrl}'); background-size: cover; background-position: top center; opacity: 0.9; transition: opacity 0.3s;"></div>
        <div class="portrait-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; height: 150px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); pointer-events: none;"></div>
        <div class="portrait-placeholder" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; pointer-events: none; opacity: 0.1;">
          <div class="p-text" style="font-size: 5rem; font-weight: 900; letter-spacing: -2px;">PERSONNEL</div>
          <div class="p-sub" style="font-size: 1.5rem; text-align: right;">RI-ARCHIVE</div>
        </div>
        <div class="rarity-badge" style="z-index: 2; position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.6); padding: 5px 15px; border-left: 4px solid var(--teal); font-size: 1.2rem; filter: drop-shadow(0 0 10px var(--teal));">${rarityStr}</div>
      </section>

      <div class="profile-info-grid">
        <section class="section-basic section-panel">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 16px;">
            <div class="op-avatar" style="width: 72px; height: 72px; border: 2px solid var(--teal); background: #111; padding: 2px; flex-shrink: 0; box-shadow: 0 0 15px rgba(41, 182, 246, 0.2);">
              <img src="${avatarUrl}" alt="${op.name}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='/static/images/avatars/default.png'">
            </div>
            <div>
              <h1 class="op-name" style="font-size: 2.8rem; margin: 0; font-weight: 800; line-height: 1;">${op.name}</h1>
              <div class="op-id" style="color: var(--teal); font-size: 0.9rem; font-weight: 500; letter-spacing: 0.1em; margin-top: 4px;">PERSONNEL ID // RI-${op.id.toString().padStart(4, '0')}</div>
            </div>
          </div>
          
          <div class="basic-tags" style="display: flex; gap: 12px; margin-bottom: 24px;">
            <span class="tag tag-class" style="background: var(--teal); color: #000; padding: 6px 16px; font-weight: 800; font-size: 0.85rem; clip-path: polygon(0% 0%, 90% 0%, 100% 100%, 0% 100%);">${op.class}</span>
            <span class="tag tag-branch" style="border: 1px solid var(--border); padding: 6px 16px; font-size: 0.85rem; font-weight: 700; color: #eee;">${op.branch}</span>
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
                <div class="level-control" style="display: flex; align-items: center; border: 1px solid var(--border); background: rgba(255,255,255,0.02); height: 32px; border-radius: 4px; overflow: hidden;">
                    <button onclick="changeLevel(-1)" style="background: none; border: none; color: var(--teal); padding: 0 10px; cursor: pointer; font-weight: 800; font-size: 1.2rem; border-right: 1px solid var(--border); transition: all 0.2s; height: 100%; display: flex; align-items: center;">-</button>
                    <input type="number" id="input-level" value="${defaultLevel}" onchange="validateAndRefreshLevel()" style="width: 45px; background: none; border: none; color: var(--text); text-align: center; font-family: 'Inter', sans-serif; font-weight: 800; font-size: 0.9rem; -moz-appearance: textfield; padding: 0;">
                    <button onclick="changeLevel(1)" style="background: none; border: none; color: var(--teal); padding: 0 10px; cursor: pointer; font-weight: 800; font-size: 1.2rem; border-left: 1px solid var(--border); transition: all 0.2s; height: 100%; display: flex; align-items: center;">+</button>
                </div>
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
          ${op.skills && op.skills.length > 0 ? op.skills.map(s => {
            const sIcon = s.icon_url || `/static/images/skills/${s.name}.png`;
            return `
            <div class="skill-item" style="display: grid; grid-template-columns: 60px 1fr; gap: 20px; background: rgba(255,255,255,0.02); padding: 16px; border: 1px solid rgba(255,255,255,0.05); position: relative; overflow: hidden;">
              <div class="s-icon" style="width: 60px; height: 60px; background: #000; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; z-index: 1;">
                <img src="${sIcon}" alt="${s.name}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='/static/images/skills/default.png'">
              </div>
              <div class="s-info" style="z-index: 1;">
                <h4 style="margin: 0 0 8px; color: var(--teal); font-size: 1.1rem; font-weight: 800;">${s.name}</h4>
                <p style="margin: 0; font-size: 0.85rem; color: var(--muted); line-height: 1.6;">${s.description || '無詳細描述。'}</p>
              </div>
            </div>
          `}).join('') : '<p class="empty-msg" style="color: var(--muted); font-size: 0.9rem;">查無技能資料。</p>'}
        </div>
      </section>

      <section class="section-modules section-panel">
        <h3 style="margin-top: 0; font-size: 0.85rem; color: var(--teal); font-weight: 800; letter-spacing: 0.2em; margin-bottom: 24px;">OPERATOR MODULES // 專屬模組詳情</h3>
        <div class="modules-list" style="display: grid; gap: 32px;">
          ${op.modules && op.modules.length > 0 ? op.modules.map(m => `
            <div class="module-card" style="display: grid; grid-template-columns: 280px 1fr; gap: 0; background: rgba(255,255,255,0.01); border: 1px solid var(--border); overflow: hidden;">
              <!-- 左欄：識別與條件區 -->
              <div class="module-identity" style="padding: 24px; background: rgba(0,0,0,0.2); border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div class="m-icon-wrapper" style="width: 120px; height: 120px; border: 1px solid rgba(255,255,255,0.1); background: #000; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; position: relative; box-shadow: inset 0 0 20px rgba(41, 182, 246, 0.05);">
                   <img src="${m.icon_url || `/static/images/modules/${m.type || 'default'}.png`}" alt="${m.type}" style="width: 80%; height: 80%; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\'font-size: 2rem; font-weight: 900; color: #333;\'>${m.type}</span>';">
                </div>
                <h4 style="margin: 0 0 16px; color: #FFF; font-size: 1.4rem; font-weight: 900; letter-spacing: 0.05em;">TYPE ${m.type}</h4>
                <div class="m-mission-box" style="width: 100%; text-align: left; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 2px;">
                   <div style="font-size: 0.65rem; color: var(--teal); font-weight: 800; margin-bottom: 6px; letter-spacing: 0.1em;">UNLOCK MISSION // 解鎖任務</div>
                   <div style="font-size: 0.8rem; color: var(--muted); line-height: 1.5; word-break: break-all;">${m.mission || '無指定任務內容。'}</div>
                </div>
              </div>
              
              <!-- 右欄：升級需求面板 -->
              <div class="module-upgrade-path" style="padding: 24px; display: flex; flex-direction: column;">
                <h5 style="margin: 0 0 20px; font-size: 0.7rem; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase;">Upgrade Requirements // 升級所需素材</h5>
                <div style="display: flex; flex-direction: column; gap: 16px; flex: 1; justify-content: space-between;">
                  ${Object.keys(m.materials || {}).map(lv => `
                    <div class="lvl-row" style="display: flex; align-items: center; gap: 20px; min-height: 52px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 12px;">
                      <div class="lvl-label" style="font-size: 0.9rem; font-weight: 900; color: var(--teal); min-width: 70px; font-family: 'JetBrains Mono', monospace;">LV.${lv.padStart(2, '0')} ›</div>
                      <div class="mat-group" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                        ${m.materials[lv].map(mat => `
                          <div class="material-obj" style="display: flex; align-items: center; gap: 8px; background: #1a1a1a; padding: 4px 12px 4px 4px; border: 1px solid #333; border-radius: 2px; transition: all 0.2s;">
                            <div style="width: 36px; height: 36px; background: #222; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05);">
                               <div style="width: 28px; height: 28px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden;">
                                   <img src="${mat.icon || ''}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\'font-size: 10px; color: var(--muted);\'>${mat.name[0]}</span>';">
                               </div>
                            </div>
                            <span style="font-size: 1rem; font-weight: 800; color: #eee; font-family: 'Inter', sans-serif;">${mat.amount}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
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
    const levelInput = document.querySelector('#input-level');
    if (!eliteSelect || !levelInput) return;

    const elite = parseInt(eliteSelect.value);
    const stageData = currentOpData.all_stats.find(s => s.elite_stage === elite);
    
    if (!stageData) {
        levelInput.value = 1;
        levelInput.max = 1;
        return;
    }

    levelInput.max = stageData.max_level;
    levelInput.value = stageData.max_level;
}

function changeLevel(delta) {
    const levelInput = document.querySelector('#input-level');
    if (!levelInput) return;
    
    let newLevel = parseInt(levelInput.value) + delta;
    const max = parseInt(levelInput.max) || 1;
    
    if (newLevel < 1) newLevel = 1;
    if (newLevel > max) newLevel = max;
    
    levelInput.value = newLevel;
    updateStatsDisplay();
}

function validateAndRefreshLevel() {
    const levelInput = document.querySelector('#input-level');
    if (!levelInput) return;
    
    let value = parseInt(levelInput.value);
    const max = parseInt(levelInput.max) || 1;
    
    if (isNaN(value) || value < 1) value = 1;
    if (value > max) value = max;
    
    levelInput.value = value;
    updateStatsDisplay();
}

window.changeLevel = changeLevel;
window.validateAndRefreshLevel = validateAndRefreshLevel;
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
