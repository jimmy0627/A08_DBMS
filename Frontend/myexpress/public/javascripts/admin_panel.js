(function() {
    const API_BASE = '/api';
    let dropRowCount = 0;  // 追蹤掉落記錄編號
    let materialsList = []; // 快取素材清單供下拉選單使用

    document.addEventListener('DOMContentLoaded', async () => {
        const user = auth.getUser();
        if (!user || !user.is_admin) {
            alert('UNAUTHORIZED_ACCESS: 您不具備管理員權限。');
            window.location.href = '/';
            return;
        }

        // 初始化：獲取所有素材資料
        try {
            const resp = await fetch(`${API_BASE}/materials/list/`);
            const data = await resp.json();
            if (data.status === 'success') {
                // 根據 API 格式，素材清單在 data.data 中
                materialsList = data.data || [];
            }
        } catch (err) {
            console.error('[Init Error] 無法獲取素材清單:', err);
        }

        // 1. 新增幹員
        const opForm = document.getElementById('form-add-operator');
        opForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(opForm);
            const body = Object.fromEntries(formData.entries());
            
            try {
                const resp = await fetch(`${API_BASE}/admin/operators/create/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await resp.json();
                if (data.status === 'success') {
                    alert(data.message);
                    opForm.reset();
                } else {
                    alert('失敗: ' + data.message);
                }
            } catch (err) { alert('系統連線異常'); }
        });

        // 2. 新增素材
        const matForm = document.getElementById('form-add-material');
        matForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const body = {
                name: matForm.name.value,
                icon_url: matForm.icon_url.value,
                rarity: parseInt(matForm.rarity.value)
            };
            
            try {
                const resp = await fetch(`${API_BASE}/admin/materials/create/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await resp.json();
                if (data.status === 'success') {
                    alert(data.message);
                    matForm.reset();
                } else {
                    alert('失敗: ' + data.message);
                }
            } catch (err) { alert('系統連線異常'); }
        });

        // 3. 新增關卡（含掉落配置）
        const stageForm = document.getElementById('form-add-stage');
        const dropsContainer = document.getElementById('drops-container');
        const btnAddDrop = document.getElementById('btn-add-drop');

        // 掉落行模板函數
        function createDropRow(rowId) {
            const row = document.createElement('div');
            row.id = `drop-row-${rowId}`;
            row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 80px; gap: 10px; align-items: end; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border);';
            
            // 建立素材下拉選項
            const options = materialsList.map(m => `<option value="${m.id}">${m.name} (ID:${m.id})</option>`).join('');
            
            row.innerHTML = `
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: 0.7rem;">選擇掉落素材</label>
                    <select class="drop-material-id" style="padding: 8px;">
                        <option value="">-- 請選擇素材 --</option>
                        ${options}
                    </select>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: 0.7rem;">掉落機率</label>
                    <select class="drop-rate" style="padding: 8px;">
                        <option value="固定">固定</option>
                        <option value="大概率" selected>大概率</option>
                        <option value="中概率">中概率</option>
                        <option value="小概率">小概率</option>
                        <option value="罕見">罕見</option>
                    </select>
                </div>
                <button type="button" class="btn-remove-drop" style="background: var(--red); color: #fff; border: none; cursor: pointer; padding: 8px 12px; font-size: 0.8rem; font-weight: bold;">移除</button>
            `;

            // 移除按鈕事件
            row.querySelector('.btn-remove-drop').addEventListener('click', () => {
                row.remove();
            });

            return row;
        }

        // 新增掉落按鈕事件
        btnAddDrop.addEventListener('click', () => {
            if (materialsList.length === 0) {
                alert('警告: 素材清單仍為空，請確認後端 API 是否正常運作。');
            }
            dropsContainer.appendChild(createDropRow(dropRowCount++));
        });

        stageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 收集掉落數據
            const drops = [];
            document.querySelectorAll('#drops-container > div').forEach(row => {
                const materialIdValue = row.querySelector('.drop-material-id').value;
                const dropRate = row.querySelector('.drop-rate').value;
                if (materialIdValue) {
                    drops.push({ material_id: parseInt(materialIdValue), drop_rate: dropRate });
                }
            });
            
            const body = {
                stage_id: stageForm.stage_id.value,
                name: stageForm.name.value,
                energy_cost: parseInt(stageForm.energy_cost.value),
                map_url: stageForm.map_url.value,
                description: stageForm.description.value,
                drops: drops
            };
            
            try {
                const resp = await fetch(`${API_BASE}/stages/create/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data = await resp.json();
                if (data.status === 'success') {
                    alert(data.message);
                    stageForm.reset();
                    dropsContainer.innerHTML = '';  // 清空掉落行
                    dropRowCount = 0;
                } else {
                    alert('失敗: ' + data.message);
                }
            } catch (err) { alert('系統連線異常'); }
        });
    });
})();
