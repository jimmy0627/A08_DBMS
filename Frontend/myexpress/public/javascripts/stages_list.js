/**
 * stages_list.js - Rhodes Island Combat Database List
 */

(function() {
    const container = document.getElementById('stages-list-container');

    async function fetchStages() {
        try {
            const response = await fetch('/api/stages/');
            const data = await response.json();

            if (data.status === 'success') {
                renderStages(data.data);
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('CONNECTION_ERROR // 無法連接至 PRTS 伺服器');
        }
    }

    function renderStages(stages) {
        if (!stages || stages.length === 0) {
            container.innerHTML = '<div class="loading-state">[ NO DATA // 暫無數據 ]</div>';
            return;
        }

        container.innerHTML = stages.map(stage => `
            <div class="stage-row">
                <div class="stage-thumb" style="background-image: url('/static/images/maps/${stage.stage_id}.png')"></div>
                <div class="stage-info">
                    <div class="stage-id">${stage.stage_id}</div>
                    <div class="stage-name">${stage.name}</div>
                </div>
                <div class="stage-cost">理智消耗 // AP COST<span class="cost-value">${stage.energy_cost}</span></div>
                <button class="btn-view" onclick="location.href='/stage_detail.html?id=${stage.stage_id}'">[ VIEW DROPS // 查看掉落 ]</button>
            </div>
        `).join('');
    }

    function showError(msg) {
        container.innerHTML = `<div class="loading-state" style="color:var(--red);">[ ERROR: ${msg} ]</div>`;
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', fetchStages);
})();
