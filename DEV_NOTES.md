# 📝 羅德島系統開發備忘錄 (2026-06-05 版)

#### 1. 核心資料庫結構 (Database Schema)
資料庫預設名稱為 `arkwikidatabase`，主要分為以下模組：

*   **人事模組 (Personnel)**
    *   `operator`: 儲存幹員基本屬性（ID、星級、職業、分支、性別）。
    *   `op_state`: 核心數值表。存儲不同精英化階段 (`elite_stage`) 下的 HP、ATK、DEF 等 MAX/MIN 數值。
    *   `op_tag`: 招募標籤。
    *   `operator_profile`: 幹員傳記、CV 與繪師資訊。
*   **物流與資源 (Logistics & Items)**
    *   `material`: 素材圖鑑（名稱、圖示）。
    *   `op_material / skill_material / module_material`: 關聯表，定義升級所需素材與數量。
*   **作戰與掉落 (Combat & Drops)**
    *   `stages`: 關卡資訊（ID、名稱、理智消耗）。
    *   `stage_drop`: 掉落關係表。使用 Enum (`固定`, `大概率`, `中概率`, `小概率`, `罕見`) 定義機率。
*   **使用者與社交 (User & Social)**
    *   `user / reg_user`: 帳號與暱稱資訊。
    *   `own`: 玩家持有的幹員小隊 (`Roster`)，包含當前練度與目標練度。
    *   `guides / guide_comment`: 攻略發布系統與留言板。

#### 2. API 調用規範 (Backend API Guidelines)
所有 API 層級皆從 `/api/` 開始，採 RESTful 风格設計：

| 功能類別 | 端點 (Endpoint) | 方法 | 說明 |
| :--- | :--- | :--- | :--- |
| **身分驗證** | `/auth/login/` | POST | 登入驗證，成功後傳回 `user_info` |
| **圖鑑清單** | `/operators/list/` | GET | 獲取全幹員 MAX 狀態資料 |
| **素材系統** | `/materials/list/` | GET | 素材清單，包含最佳掉落關卡與需求預核 |
| **小隊管理** | `/operators/roster/add/` | POST | 將幹員加入玩家的 Dossier |
| **小隊管理** | `/users/<id>/roster/` | GET | 獲取特定玩家的小隊練習進度 |
| **攻略內容** | `/stages/<id>/guides/` | GET | 獲取特定關卡的玩家投稿攻略 |
| **詳細資訊** | `/operator/<id>/detail/` | GET | 獲取單一幹員的完整屬性、技能與模組 |

#### 3. 未來開發注意事項 (Development Tips)
1.  **數值過濾**：查詢幹員列表時，務必使用子查詢過濾出每個幹員的 `MAX(elite * 1000 + level)`，否則會顯示多筆重複資料或導致低星幹員消失。
2.  **前端環境**：目前的 Express Proxy 將前端 `/api` 請求轉發至 Django 的 `127.0.0.1:8000/api`。
3.  **路記管理**：靜態素材建議儲存在 `/static/images/`，並在資料庫中存儲相對路徑。
