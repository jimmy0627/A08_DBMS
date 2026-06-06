/**
 * profile.js - Rhodes Island Personnel Profile Management
 * Connects to Wiki_Database API to display user dossier, roster, and activity records.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Identity Check
    const user = auth.getUser();
    if (!user) {
        alert('UNAUTHORIZED ACCESS // 請先登入系統');
        location.href = '/login.html';
        return;
    }

    // Initialize UI with User Info
    document.getElementById('profile-nickname').textContent = user.nickname.toUpperCase();
    document.getElementById('profile-uid').textContent = `#RI-${user.user_id.toString().padStart(4, '0')}`;
    document.getElementById('profile-email').textContent = user.email;

    // 2. Fetch Roster Data
    await loadProfileData(user.user_id);
});

/**
 * Loads all profile related data from backend
 */
async function loadProfileData(userId) {
    const rosterGrid = document.getElementById('roster-grid');
    const opCountLabel = document.getElementById('count-operators');
    const trackerList = document.getElementById('tracker-list');
    const guidesList = document.getElementById('guides-list');
    const guideCountLabel = document.getElementById('count-guides');

    try {
        // 1. Load Roster and Tracker
        const rosterRes = await fetch(`/api/users/${userId}/roster/`);
        const rosterData = await rosterRes.json();

        if (rosterData.status === 'success' && rosterData.roster) {
            const roster = rosterData.roster;
            opCountLabel.textContent = roster.length;

            // Update Roster Grid
            if (roster.length === 0) {
                rosterGrid.innerHTML = '<p style="color:var(--muted); grid-column:1/-1; padding:20px;">[ EMPTY ] 尚未登記任何幹員檔案</p>';
                trackerList.innerHTML = '<p style="color:var(--muted); padding:20px;">無養成計畫</p>';
            } else {
                rosterGrid.innerHTML = '';
                trackerList.innerHTML = '';
                
                roster.forEach(item => {
                    // Update Roster Grid
                    const unit = document.createElement('div');
                    unit.className = 'roster-unit';
                    unit.innerHTML = `
                        <div class="unit-thumb" style="background-color: #333">
                            <span>${item.name[0]}</span>
                            <button class="unit-delete" onclick="deleteFromRoster('${item.operator_id}', '${item.name}')" title="註銷檔案">×</button>
                        </div>
                        <div class="unit-level">E${item.current_elite} ${item.current_level}</div>
                    `;
                    rosterGrid.appendChild(unit);

                    // Update Tracker (Redesigned with Calculator)
                    const li = document.createElement('li');
                    li.className = 'tracker-item';
                    li.id = `tracker-${item.operator_id}`;
                    
                    li.innerHTML = `
                        <div class="tracker-main-row" onclick="event.stopPropagation()">
                            <div class="op-brief">
                                <h4>${item.name}</h4>
                                <span>ELITE PROMOTION PLAN</span>
                            </div>
                            
                            <div class="inputs-area">
                                <div class="select-group">
                                    <label>CURR</label>
                                    <select class="tracker-select" id="curr-e-${item.operator_id}">
                                        <option value="0" ${item.current_elite==0?'selected':''}>Elite 0</option>
                                        <option value="1" ${item.current_elite==1?'selected':''}>Elite 1</option>
                                        <option value="2" ${item.current_elite==2?'selected':''}>Elite 2</option>
                                    </select>
                                </div>

                                <span style="color:var(--muted); font-weight:900; font-size:1.2rem;">〉〉</span>

                                <div class="select-group">
                                    <label>TARGET</label>
                                    <select class="tracker-select" id="targ-e-${item.operator_id}">
                                        <option value="0" ${item.target_elite==0?'selected':''}>Elite 0</option>
                                        <option value="1" ${item.target_elite==1?'selected':''}>Elite 1</option>
                                        <option value="2" ${item.target_elite==2?'selected':''}>Elite 2</option>
                                    </select>
                                </div>
                                
                                <button class="btn-recalc" onclick="recalculateUpgrade(${userId}, ${item.operator_id})">
                                    CALCULATE MATERIALS
                                </button>
                            </div>
                        </div>
                        <div class="material-accordion" id="accordion-${item.operator_id}">
                            <div class="materials-inner">
                                <div class="material-report-grid" id="mat-grid-${item.operator_id}">
                                    <!-- Dynamic Material Cards -->
                                </div>
                            </div>
                        </div>
                    `;
                    trackerList.appendChild(li);
                });

                if (trackerList.innerHTML === '') {
                    trackerList.innerHTML = '<p style="color:var(--muted); padding:20px;">所有幹員皆已達到目標精銳等級</p>';
                }
            }
        }

        // 2. Load Guides
        const guideRes = await fetch(`/api/users/${userId}/guides/`);
        const guideData = await guideRes.json();

        if (guideData.status === 'success' && guideData.data) {
            const guides = guideData.data;
            guideCountLabel.textContent = guides.length;

            if (guides.length === 0) {
                guidesList.innerHTML = '<p style="color:var(--muted); padding:20px;">尚未發布任何攻略紀錄</p>';
            } else {
                guidesList.innerHTML = '';
                guides.forEach(rec => {
                    const item = document.createElement('div');
                    item.className = `record-item ${rec.status === 'moderated' ? 'moderated' : ''}`;
                    item.innerHTML = `
                        <div class="record-stage">${rec.stage_id}</div>
                        <div class="record-main">
                            <div class="record-title">
                                <a href="/guide_detail.html?id=${rec.id}" class="guide-link">${rec.title}</a>
                            </div>
                            <div class="record-meta">
                                ${rec.date}
                                <span class="status-tag status-${rec.status}">
                                    [ ${rec.status.toUpperCase()} ]
                                </span>
                            </div>
                        </div>
                    `;
                    guidesList.appendChild(item);
                });
            }
        }

    } catch (err) {
        console.error('Data fetch failed', err);
        rosterGrid.innerHTML = '<p style="color:var(--red);">[ ERROR ] 通訊異常</p>';
    }
}

/**
 * Helper: Generate deterministic color based on ID for visual variety
 */
function getRarityColor(id) {
    const colors = ['#333', '#444', '#222', '#1a1a1a'];
    return colors[id % colors.length];
}

async function deleteFromRoster(opId, opName) {
    if (!confirm(`[警告] 確定要將幹員「${opName}」的人事檔案從名冊中註銷嗎？\n此動作不可逆。`)) return;

    const user = auth.getUser();
    if (!user) return;

    try {
        const response = await fetch(`/api/users/${user.user_id}/operators/${opId}/delete/`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert(`[羅德島人事部] 幹員「${opName}」的檔案已註銷。`);
            location.reload(); // Refresh to update Roster and Tracker
        } else {
            alert(result.message || '刪除失敗');
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('通訊失敗，無法執行註銷指令');
    }
}

/**
 * Recalculate material requirements based on user selection
 */
async function recalculateUpgrade(userId, opId) {
    const ce = document.getElementById(`curr-e-${opId}`).value;
    const cl = 1; // Default since level UI is removed
    const te = document.getElementById(`targ-e-${opId}`).value;
    const tl = 90; // Default since level UI is removed

    const accordion = document.getElementById(`accordion-${opId}`);
    const grid = document.getElementById(`mat-grid-${opId}`);
    const itemWrapper = document.getElementById(`tracker-${opId}`);

    try {
        const res = await fetch(`/api/users/${userId}/operators/${opId}/calc-upgrade/?curr_elite=${ce}&curr_level=${cl}&targ_elite=${te}&targ_level=${tl}`);
        const data = await res.json();

        if (data.status === 'success') {
            grid.innerHTML = '';
            
            if (data.total_materials.length === 0) {
                grid.innerHTML = '<p style="color:var(--muted); padding:10px;">目標區間內無精英化素材需求</p>';
            } else {
                data.total_materials.forEach(mat => {
                    const card = document.createElement('div');
                    card.className = `mat-card ${mat.best_stage ? 'has-data' : 'no-data'}`;
                    
                    let stageInfoHtml = '';
                    if (mat.best_stage) {
                        stageInfoHtml = `
                            <div class="mat-stage-info">
                                RECOMMENDED: <span class="mat-stage-id">${mat.best_stage.stage_id}</span> 
                                (${mat.best_stage.drop_rate})
                            </div>
                            <div class="mat-prediction">
                                EST. RUNS: ${mat.best_stage.expected_runs} | TOTAL AP: ${mat.best_stage.expected_energy}
                            </div>
                        `;
                    } else {
                        stageInfoHtml = `
                            <div class="no-data-msg">
                                [ DATA MISSING ] // 無法取得掉落資訊
                            </div>
                        `;
                    }

                    card.innerHTML = `
                        <div class="mat-icon-box">
                            <img src="${mat.icon}" alt="${mat.name}" style="width:100%; height:100%; object-fit:contain;">
                        </div>
                        <div class="mat-body">
                            <div class="mat-info-top">
                                <span class="mat-name">${mat.name}</span>
                                <span class="mat-req">x${mat.amount}</span>
                            </div>
                            ${stageInfoHtml}
                        </div>
                    `;
                    grid.appendChild(card);
                });
            }

            // Show Accordion
            itemWrapper.classList.add('active');
            accordion.classList.add('show');
        }
    } catch (err) {
        console.error('Calculation failed', err);
        alert('計算請求失敗，連線受阻');
    }
}

window.recalculateUpgrade = recalculateUpgrade;
window.deleteFromRoster = deleteFromRoster;
