# Arknights Wiki Modernization Tasks

依據 `arknights_final_db.sql` 最新 Schema (v2.0) 進行的 Wiki 優化與擴充計畫。

## 🎯 總體目標
將 Wiki 前端之數據顯示精度提升至「精英化階段」等級，並實作模組與素材圖鑑系統。

---

## 📋 任務清單

### 1. 幹員列表頁面升級 (Operator List v2)
- [ ] **數據模型適配**：修改 `operators.js` 以連結 `operator` 基礎表與 `op_state` 狀態表。
- [ ] **新增基礎欄位**：在幹員卡片中加入 `branch` (分支) 與 `sex` (性別) 顯示。
- [ ] **精英化切換功能 (Elite Toggle)**：
    - 實作 UI 切換開關 (E0 / E1 / E2)。
    - 點擊時同步更新 HP, ATK, DEF, RES 等戰鬥數值。
- [ ] **標籤系統 (Tag System)**：將 `op_tag` 數據轉化為卡片上的視覺小標籤 (如：輸出、生存)。

### 2. 模組系統實作 (Module System)
- [ ] **模組列表視圖**：設計並實作幹員模組顯示區。
- [ ] **詳細資料展示**：顯示模組類型 (X/Y/D) 與 `unlock_mission` (解鎖任務)。
- [ ] **需求素材**：連結 `module_material` 與 `material` 表，列出升級所需素材清單。

### 3. 素材圖鑑頁面開發 (Material Archive)
- [ ] **建立 Material 頁面**：新增 `material.html` 與對應的 CSS/JS。
- [ ] **實作圖鑑列表**：從 `material` 表抓取全體素材，以 Grid 形式展示圖示 (`icon_url`) 與名稱。

### 4. 攻略與評論系統強化 (Guide & Social)
- [ ] **用戶歸屬**：在攻略清單中正確顯示 `reg_user` 對應的作者名稱。
- [ ] **留言板 UI**：基於 `guide_comment` 表預留評論輸入與顯示區塊。

### 5. 後端 API 代理調整 (Backend Support)
- [ ] **路由更新**：確保 `/api/operators/` 能根據傳入的 `id` 與 `elite_stage` 回傳正確的數據。
- [ ] **同源代理優化**：檢查 `app.js` 中的代理邏輯是否能處理帶有參數的複雜查詢。

---

## 🛠 已完成項目
- [x] 主頁面佈局羅德島終端化改版。
- [x] 幹員列表基礎表格頁面建立。
- [x] SQL Schema 差異化分析完成。

---
*最後更新日期：2026-06-06*
