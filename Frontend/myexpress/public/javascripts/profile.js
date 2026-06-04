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
                            <button class="unit-delete" onclick="deleteFromRoster(${item.operator_id}, '${item.name}')" title="註銷檔案">×</button>
                        </div>
                        <div class="unit-level">E${item.current_elite} ${item.current_level}</div>
                    `;
                    rosterGrid.appendChild(unit);

                    // Update Tracker (only show if not at target yet)
                    if (item.current_elite < item.target_elite || (item.current_elite === item.target_elite && item.current_level < item.target_level)) {
                        const li = document.createElement('li');
                        li.className = 'tracker-item';
                        li.innerHTML = `
                            <div class="op-identity">
                                <h4>${item.name}</h4>
                                <span>// OP-ID: ${item.operator_id}</span>
                            </div>
                            <div class="progress-display">
                                <span>E${item.current_elite} / LV ${item.current_level}</span>
                                <span class="arrow-sep">〉</span>
                                <span class="progress-target">E${item.target_elite} / LV ${item.target_level}</span>
                            </div>
                            <button class="btn-material" onclick="location.href='/operator/${item.operator_id}'">詳細檔案</button>
                        `;
                        trackerList.appendChild(li);
                    }
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
                            <div class="record-title">${rec.title}</div>
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

    const user = JSON.parse(localStorage.getItem('prts_user') || 'null');
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

window.deleteFromRoster = deleteFromRoster;
