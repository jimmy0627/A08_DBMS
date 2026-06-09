/**
 * PRTS 戰術分析終端 - 單篇攻略詳情腳本
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 從 URL 獲取 guide_id
    const urlParams = new URLSearchParams(window.location.search);
    const guideId = urlParams.get('id');

    if (!guideId) {
        alert("戰術日誌編號缺失，正在返回主頁面 // ERROR_CODE: 404");
        window.location.href = '/';
        return;
    }

    // 2. 透過 auth 模組獲取用戶資訊
    const user = auth.getUser();
    const currentUserId = user ? user.user_id : null;

    // 3. 載入攻略詳情
    loadGuideDetail(guideId, currentUserId);

    // 4. 綁定按鈕事件
    document.getElementById('submit-comment').addEventListener('click', () => postComment(guideId, currentUserId));
    
    // 如果未登入，禁用留言框與按鈕
    if (!currentUserId) {
        const textarea = document.getElementById('comment-text');
        textarea.placeholder = "請先登入後再進行通訊互動...";
        textarea.disabled = true;
        document.getElementById('submit-comment').disabled = true;
        document.getElementById('submit-comment').textContent = "UNAUTHORIZED";
    }

    document.getElementById('delete-guide').addEventListener('click', () => deleteGuide(guideId));
});

/**
 * 載入攻略主體與留言
 */
async function loadGuideDetail(id, currentUserId) {
    try {
        const response = await fetch(`/api/guides/${id}/detail/`);
        const result = await response.json();

        if (result.status === 'success') {
            const data = result.data;

            // 渲染主體
            document.getElementById('guide-title').textContent = data.title;
            document.getElementById('author-name').textContent = data.author_nickname;
            document.getElementById('publish-date').textContent = data.created_at;
            document.getElementById('guide-content').textContent = data.content;

            // 渲染關卡資訊
            document.getElementById('stage-code').textContent = data.stage_id;
            document.getElementById('stage-name').textContent = data.stage_name;
            document.getElementById('stage-cost').textContent = data.energy_cost;

            // 渲染留言
            renderComments(data.comments);

            // 權限檢查：作者本人 OR 管理員 可以看到刪除按鈕
            const user = auth.getUser();
            const isAdmin = user && user.is_admin;
            if (isAdmin || (currentUserId && parseInt(currentUserId) === data.author_id)) {
                document.getElementById('admin-zone').style.display = 'block';
                if (isAdmin && (currentUserId && parseInt(currentUserId) !== data.author_id)) {
                    const btn = document.getElementById('delete-guide');
                    btn.textContent = "[ ADMIN FORCE DELETE // 管理員強制註銷 ]";
                    btn.style.color = "var(--red)";
                    btn.style.borderColor = "var(--red)";
                }
            }

        } else {
            alert("載入失敗: " + result.message);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

/**
 * 渲染留言列表
 */
function renderComments(comments) {
    const list = document.getElementById('comments-list');
    list.innerHTML = '';

    if (!comments || comments.length === 0) {
        list.innerHTML = '<div style="padding: 16px; color: var(--muted); font-size: 0.9rem;">目前尚無通訊記錄...</div>';
        return;
    }

    comments.forEach(c => {
        const user = auth.getUser();
        const isAdmin = user && user.is_admin;
        const currentUserId = user ? user.user_id : null;
        
        const item = document.createElement('div');
        item.className = 'comment-item';
        item.style.position = 'relative';
        
        let deleteBtn = '';
        if (isAdmin) {
             const commentText = c.text.replace(/"/g, '&quot;');
             deleteBtn = `<button onclick="adminDeleteComment('${commentText}')" style="position: absolute; right: 0; top: 0; background: none; border: none; color: var(--red); cursor: pointer; font-size: 0.8rem; font-weight: 800;">[ DELETE ]</button>`;
        }

        item.innerHTML = `
            <div class="comment-user">@${c.nickname}</div>
            <div class="comment-content">${c.text}</div>
            ${deleteBtn}
        `;
        list.appendChild(item);
    });
}

/**
 * 管理員刪除留言
 */
async function adminDeleteComment(commentText) {
    if (!confirm("[ WARNING: 管理員操作 - 確定要刪除此條通訊紀錄嗎？ ]")) return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const guideId = urlParams.get('id');
        
        const response = await fetch(`/api/admin/guides/comments/delete/`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guide_id: guideId,
                comment_text: commentText
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            alert("通訊紀錄已抹除");
            const user = auth.getUser();
            loadGuideDetail(guideId, user ? user.user_id : null);
        } else {
            alert("刪除失敗: " + result.message);
        }
    } catch (err) {
        console.error("Delete comment error:", err);
    }
}

window.adminDeleteComment = adminDeleteComment;

/**
 * 發布留言
 */
async function postComment(guideId, userId) {
    if (!userId) {
        alert("權限不足：請先登入羅德島終端以發送通訊。");
        return;
    }

    const text = document.getElementById('comment-text').value.trim();
    if (!text) {
        alert("通訊內容不可為空。");
        return;
    }

    try {
        const response = await fetch(`/api/guides/${guideId}/comments/create/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                comment_text: text
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            // 清空輸入並重新載入
            document.getElementById('comment-text').value = '';
            loadGuideDetail(guideId, userId);
        } else {
            alert("通訊失敗: " + result.message);
        }
    } catch (err) {
        console.error("Post Error:", err);
    }
}

/**
 * 刪除攻略
 */
async function deleteGuide(id) {
    if (!confirm("警告：此操作將永久銷毀戰術日誌。是否繼續？")) return;

    try {
        const response = await fetch(`/api/guides/${id}/delete/`, { method: 'DELETE' });
        const result = await response.json();

        if (result.status === 'success') {
            alert("日誌已註銷。");
            window.location.href = '/'; // 刪完回主頁
        } else {
            alert("刪除失敗: " + result.message);
        }
    } catch (err) {
        console.error("Delete Error:", err);
    }
}
