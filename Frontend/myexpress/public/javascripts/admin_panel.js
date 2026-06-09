(function() {
    const API_BASE = '/api';

    document.addEventListener('DOMContentLoaded', () => {
        const user = auth.getUser();
        if (!user || !user.is_admin) {
            alert('UNAUTHORIZED_ACCESS: 您不具備管理員權限。');
            window.location.href = '/';
            return;
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
                icon_url: matForm.icon_url.value
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

        // 3. 新增關卡
        const stageForm = document.getElementById('form-add-stage');
        stageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const body = {
                stage_id: stageForm.stage_id.value,
                name: stageForm.name.value,
                energy_cost: parseInt(stageForm.energy_cost.value)
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
                } else {
                    alert('失敗: ' + data.message);
                }
            } catch (err) { alert('系統連線異常'); }
        });
    });
})();
