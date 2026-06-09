
let currentTab = 0;
let allMaterials = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 獲取素材清單供下拉選單使用
    try {
        const res = await fetch('/api/materials/list/');
        const data = await res.json();
        if (data.status === 'success') {
            allMaterials = data.data;
            console.log("Materials loaded:", allMaterials.length);
        }
    } catch (e) {
        console.error("Failed to load materials:", e);
    }

    // 2. 初始化第一個 Tab
    showTab(0);
});

function showTab(n) {
    const tabs = document.getElementsByClassName("tab-content");
    const btns = document.getElementsByClassName("tab-btn");
    
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
        btns[i].classList.remove("active");
    }
    
    tabs[n].classList.add("active");
    btns[n].classList.add("active");
    currentTab = n;
}

// 動態添加素材列
function addMaterialRow(containerId, elite, category) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'material-row';
    row.dataset.elite = elite;
    row.dataset.category = category;

    let options = `<option value="">-- 選擇素材 --</option>`;
    allMaterials.forEach(m => {
        options += `<option value="${m.id}">${m.name}</option>`;
    });

    row.innerHTML = `
        <select class="material-select">${options}</select>
        <input type="number" class="material-count" placeholder="數量" min="1" value="1">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(row);
}

// 提交表單
async function submitOperator() {
    const form = document.getElementById('full-operator-form');
    const formData = new FormData(form);
    
    // 構建 JSON
    const payload = {
        name: document.getElementById('name').value,
        rarity: parseInt(document.getElementById('rarity').value),
        class: document.getElementById('class').value,
        branch: document.getElementById('branch').value,
        position: document.getElementById('position').value,
        sex: document.getElementById('sex').value,
        image_url: document.getElementById('image_url').value,
        avatar_url: document.getElementById('avatar_url').value,
        illustrator: document.getElementById('illustrator').value,
        voice_actor: document.getElementById('voice_actor').value,
        profile_text: document.getElementById('profile_text').value,
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t),
        states: [],
        materials: [],
        skills: [],
        modules: []
    };

    // 收集數值 (States)
    for (let e = 0; e <= 2; e++) {
        payload.states.push({
            elite: e,
            max_level: parseInt(document.getElementById(`max_level_e${e}`).value || 0),
            hp: parseInt(document.getElementById(`hp_e${e}`).value || 0),
            atk: parseInt(document.getElementById(`atk_e${e}`).value || 0),
            def: parseInt(document.getElementById(`def_e${e}`).value || 0),
            res: parseInt(document.getElementById(`res_e${e}`).value || 0),
            redeploy: parseInt(document.getElementById(`redeploy_e${e}`).value || 0),
            cost: parseInt(document.getElementById(`cost_e${e}`).value || 0),
            block: parseInt(document.getElementById(`block_e${e}`).value || 0),
            atk_speed: parseFloat(document.getElementById(`atk_speed_e${e}`).value || 1.0)
        });
    }

    // 收集精英化素材
    document.querySelectorAll('#material-list-base .material-row').forEach(row => {
        const mid = row.querySelector('.material-select').value;
        const count = row.querySelector('.material-count').value;
        if (mid) payload.materials.push({ elite: parseInt(row.dataset.elite), material_id: parseInt(mid), count: parseInt(count) });
    });

    // 收集技能及其素材
    // (此處簡化處理，實際可能需要多個技能輸入)
    const skName = document.getElementById('skill_name_1').value;
    if (skName) {
        let skMats = [];
        document.querySelectorAll('#skill-material-list-1 .material-row').forEach(row => {
            const mid = row.querySelector('.material-select').value;
            const count = row.querySelector('.material-count').value;
            if (mid) skMats.push({ mastery: 3, material_id: parseInt(mid), count: parseInt(count) });
        });
        payload.skills.push({
            name: skName,
            icon: document.getElementById('skill_icon_1').value,
            description: document.getElementById('skill_desc_1').value,
            materials: skMats
        });
    }

    // 收集模組及其素材
    const modName = document.getElementById('module_name_1').value;
    if (modName) {
        let modMats = [];
        document.querySelectorAll('#module-material-list-1 .material-row').forEach(row => {
            const mid = row.querySelector('.material-select').value;
            const count = row.querySelector('.material-count').value;
            if (mid) modMats.push({ level: 3, material_id: parseInt(mid), count: parseInt(count) });
        });
        payload.modules.push({
            name: modName,
            type: document.getElementById('module_type_1').value,
            mission: document.getElementById('module_mission_1').value,
            icon: '', // 預設或擴充欄位
            materials: modMats
        });
    }

    console.log("Submitting Payload:", payload);
    document.getElementById('json-output').textContent = JSON.stringify(payload, null, 2);

    try {
        const response = await fetch('/api/admin/operators/create_full/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert("成功錄入幹員！\n" + result.message);
        } else {
            alert("錄入失敗: " + result.message);
        }
    } catch (e) {
        alert("網路錯誤或伺服器未開啟");
    }
}

