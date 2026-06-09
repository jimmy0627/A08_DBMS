from django.db import connection, DatabaseError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
import json

# 1.【Read 查詢】查詢所有關卡清單 (對應 GET 請求)
def get_stages(request):
    try:
        with connection.cursor() as cursor:
            # SQL 查詢補上 description 欄位
            cursor.execute("SELECT stage_id, name, energy_cost, map_url, description FROM stages")
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                result.append({
                    "id": r[0], 
                    "stage_id": r[0],  # Added
                    "name": r[1], 
                    "cost": r[2],
                    "energy_cost": r[2], # Added
                    "map_url": r[3],
                    "description": r[4]  
                })
            
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error in get_stages]: {e}")
        return JsonResponse({"status": "error", "message": "讀取關卡列表失敗"}, status=500)
    
# 2.【Read 查詢】查詢特定關卡的掉落素材 (對應 GET 請求)
def get_stage_drops(request, stage_id):
    try:
        with connection.cursor() as cursor:
            # 透過 JOIN 關聯 Stage_Drop (中介表) 與 Material (素材表)
            # 使用 %s 作為佔位符，啟動參數化查詢機制以防止 SQL 注入
            sql = """
                SELECT M.name, SD.drop_rate 
                FROM Stage_Drop SD
                JOIN Material M ON SD.material_id = M.material_id
                WHERE SD.stage_id = %s
            """
            # 將網址列擷取到的 stage_id 作為安全參數傳入陣列中執行
            cursor.execute(sql, [stage_id])
            rows = cursor.fetchall()
            
            result = [{"material": r[0], "drop_rate": r[1]} for r in rows]
            return JsonResponse({"status": "success", "stage_id": stage_id, "drops": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        return JsonResponse({"status": "error", "message": "查詢失敗"}, status=500)

# 3.【Read 查詢】查詢特定關卡的所有攻略 (對應 GET 請求)
def get_guides_by_stage(request, stage_id):
    try:
        with connection.cursor() as cursor:
            # 修正點：表名全面改為小寫 guides 與 reg_user，且原 username 欄位已改為 nickname
            sql = """
                SELECT g.guide_id, u.nickname, g.title, g.content, g.created_at 
                FROM guides g
                JOIN reg_user u ON g.user_id = u.user_id
                WHERE g.stage_id = %s
            """
            cursor.execute(sql, [stage_id])
            rows = cursor.fetchall()
            
            # 修正點：捨棄複雜的列表推導式，換回最直觀、最好 debug 的標準 for 迴圈
            result = []
            for r in rows:
                guide_data = {
                    "id": r[0],
                    "author": r[1],
                    "title": r[2],
                    "content": r[3],
                    "date": str(r[4]) if r[4] else None  # 將 datetime 物件轉為字串，防止 JSON 序列化失敗
                }
                result.append(guide_data)
                
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        # 在後台黑視窗印出真正錯誤原因，方便小組內部除錯
        print(f"[DB Error in get_guides_by_stage]: {e}")
        return JsonResponse({"status": "error", "message": "無法取得攻略"}, status=500)
    
# 4. 【Create 新增】新增攻略 (對應 POST 請求)
@csrf_exempt  # 暫時關閉 CSRF 驗證，方便開發階段使用 Postman 測試 POST 請求
def create_guide(request):
    if request.method == 'POST':
        # 解析前端傳送過來的 JSON 格式 Body
        data = json.loads(request.body)
        try:
            with connection.cursor() as cursor:
                # 執行 INSERT 新增語法，四個 %s 對應四個外部輸入值
                sql = "INSERT INTO Guides (user_id, stage_id, title, content) VALUES (%s, %s, %s, %s)"
                
                # 嚴格將前端傳來的資料作為陣列參數傳入，交由資料庫驅動進行跳脫處理，杜絕 SQL 注入
                cursor.execute(sql, [data['user_id'], data['stage_id'], data['title'], data['content']])
                
                return JsonResponse({"status": "success", "message": "攻略發布成功"})
                
        except DatabaseError as e:
            return JsonResponse({"status": "error", "message": "發布失敗"}, status=500)

# 5. 【Delete 刪除】刪除攻略 (對應 DELETE 請求)
@csrf_exempt
def delete_guide(request, guide_id):
    if request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                # 執行 DELETE 刪除語法，根據主鍵 (guide_id) 精準刪除資料
                cursor.execute("DELETE FROM Guides WHERE guide_id = %s", [guide_id])
                return JsonResponse({"status": "success", "message": "攻略已刪除"})
                
        except DatabaseError as e:
            return JsonResponse({"status": "error", "message": "刪除失敗"}, status=500)

# 6. 【Update 更新】更新持有幹員練度 (對應 POST/PUT 請求)
@csrf_exempt
def update_own_operator(request, user_id, op_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            with connection.cursor() as cursor:
                # 執行 UPDATE 更新語法，設定新的精階與等級
                # WHERE 條件必須同時比對 user_id 與 operator_id (複合主鍵)
                sql = "UPDATE Own SET current_elite = %s, current_level = %s WHERE user_id = %s AND operator_id = %s"
                cursor.execute(sql, [data['current_elite'], data['current_level'], user_id, op_id])
                
                return JsonResponse({"status": "success", "message": "練度更新成功"})
                
        except DatabaseError as e:
            return JsonResponse({"status": "error", "message": "更新失敗"}, status=500)

# 7. 【Read 查詢】查詢幹員升級素材 (對應 GET 請求)
def get_operator_materials(request, op_name, elite_stage):
    try:
        with connection.cursor() as cursor:
            # 執行三表 JOIN：關聯 Operator, Op_Material, Material
            sql = """
                SELECT O.name, M.name, OM.amount 
                FROM Op_Material OM
                JOIN Operator O ON OM.operator_id = O.operator_id
                JOIN Material M ON OM.material_id = M.material_id
                WHERE O.name = %s AND OM.elite_stage = %s
            """
            # 傳入網址參數 op_name (例如 "銀灰") 和 elite_stage (例如 2)
            cursor.execute(sql, [op_name, elite_stage])
            rows = cursor.fetchall()
            
            # 將撈出來的陣列資料整理成結構化的 JSON
            result = [{"operator": r[0], "material": r[1], "amount": r[2]} for r in rows]
            return JsonResponse({"status": "success", "data": result}, status=200, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        # 在伺服器終端機印出真實錯誤供開發者除錯，對前端則回傳安全的泛用錯誤訊息
        print(f"[DB Error] {e}")
        return JsonResponse({"status": "error", "message": "資料庫查詢失敗"}, status=500)
    
# 8.【Read 查詢】查詢特定幹員的技能專精素材 (對應 GET 請求)
# 目的：拉出該幹員所有技能專三所需的材料清單 (包含素材圖標)
def get_skill_materials(request, op_id):
    try:
        with connection.cursor() as cursor:
            # 核心修正：在 SELECT 尾端補上 M.icon_url
            sql = """
                SELECT S.skill_name, M.name, SM.amount, M.icon_url
                FROM skill_material SM
                JOIN skill S ON SM.skill_id = S.skill_id
                JOIN material M ON SM.material_id = M.material_id
                WHERE S.op_id = %s
            """
            cursor.execute(sql, [op_id])
            rows = cursor.fetchall()

            result = []
            # 使用直觀的標準 for 迴圈逐列拆解
            for r in rows:
                item = {
                    "skill_name": r[0],      # 技能名稱 (如：真銀斬)
                    "material_name": r[1],   # 素材名稱 (如：D32鋼)
                    "amount": r[2],          # 消耗數量 (如：4)
                    "material_icon": r[3]    # 素材圖片路徑 (/static/images/materials/...)
                }
                result.append(item)
                
            return JsonResponse({"status": "success", "operator_id": op_id, "skills": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error in get_skill_materials]: {e}")
        return JsonResponse({"status": "error", "message": "查詢技能素材失敗"}, status=500)

# 9.【Read 查詢】查詢特定幹員的模組升級素材 (對應 GET 請求)
# 目的：拉出該幹員專屬模組解鎖與升級所需的材料清單 (包含素材圖標)
def get_module_materials(request, op_id):
    try:
        with connection.cursor() as cursor:
            # 核心修正：在 SELECT 尾端補上 M.icon_url
            sql = """
                SELECT MO.module_type, MO.unlock_mission, M.name, MM.amount, M.icon_url
                FROM module_material MM
                JOIN module MO ON MM.module_id = MO.module_id
                JOIN material M ON MM.material_id = M.material_id
                WHERE MO.operator_id = %s
            """
            cursor.execute(sql, [op_id])
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                item = {
                    "module_type": r[0],     # 模組類型 (如：X、Y)
                    "unlock_mission": r[1],  # 解鎖任務敘述
                    "material_name": r[2],   # 素材名稱 (如：三水錳礦)
                    "amount": r[3],          # 消耗數量
                    "material_icon": r[4]    # 素材圖片路徑
                }
                result.append(item)
                
            return JsonResponse({"status": "success", "operator_id": op_id, "modules": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error in get_module_materials]: {e}")
        return JsonResponse({"status": "error", "message": "查詢模組素材失敗"}, status=500)

# 10.【Compute 計算】核心養成計算機：一鍵計算幹員「總素材消耗總計」（對應 GET/POST 請求）
# 目的：一鍵將某位幹員（精英化 + 技能專三 + 模組）的所有素材在後端進行加總聚合 (支援開關與圖標)
def calculate_operator_total_costs(request, op_id):
    try:
        # 接收前端傳來的精英化區間，預設是從 精0 (0) 到 精二 (2)
        from_elite = int(request.GET.get('from_elite', 0))
        to_elite = int(request.GET.get('to_elite', 2))
        
        # 核心升級：接收「技能」與「模組」的計算開關，預設 1 為要計算，0 為不計算
        calc_skill = int(request.GET.get('calc_skill', 1))
        calc_module = int(request.GET.get('calc_module', 1))

        with connection.cursor() as cursor:
            materials_summary = {}

            # ==========================================
            # 1. 菁英化素材聚合計算
            # ==========================================
            sql_op = """
                SELECT M.name, SUM(OM.amount), M.icon_url 
                FROM op_material OM 
                JOIN material M ON OM.material_id = M.material_id 
                WHERE OM.operator_id = %s AND OM.elite_stage > %s AND OM.elite_stage <= %s
                GROUP BY M.name, M.icon_url
            """
            cursor.execute(sql_op, [op_id, from_elite, to_elite])
            op_rows = cursor.fetchall()
            
            for r in op_rows:
                mat_name = r[0]
                amount = int(r[1])
                icon_url = r[2]
                
                if mat_name not in materials_summary:
                    materials_summary[mat_name] = {"amount": 0, "icon": icon_url}
                materials_summary[mat_name]["amount"] += amount

            # ==========================================
            # 2. 技能素材聚合計算 (根據開關判斷是否累加)
            # ==========================================
            if calc_skill == 1:
                sql_skill = """
                    SELECT M.name, SUM(SM.amount), M.icon_url 
                    FROM skill_material SM 
                    JOIN skill S ON SM.skill_id = S.skill_id 
                    JOIN material M ON SM.material_id = M.material_id 
                    WHERE S.op_id = %s 
                    GROUP BY M.name, M.icon_url
                """
                cursor.execute(sql_skill, [op_id])
                skill_rows = cursor.fetchall()
                
                for r in skill_rows:
                    mat_name = r[0]
                    amount = int(r[1])
                    icon_url = r[2]
                    
                    if mat_name not in materials_summary:
                        materials_summary[mat_name] = {"amount": 0, "icon": icon_url}
                    materials_summary[mat_name]["amount"] += amount

            # ==========================================
            # 3. 模組素材聚合計算 (根據開關判斷是否累加)
            # ==========================================
            if calc_module == 1:
                sql_mod = """
                    SELECT M.name, SUM(MM.amount), M.icon_url 
                    FROM module_material MM 
                    JOIN module MO ON MM.module_id = MO.module_id 
                    JOIN material M ON MM.material_id = M.material_id 
                    WHERE MO.operator_id = %s 
                    GROUP BY M.name, M.icon_url
                """
                cursor.execute(sql_mod, [op_id])
                mod_rows = cursor.fetchall()
                
                for r in mod_rows:
                    mat_name = r[0]
                    amount = int(r[1])
                    icon_url = r[2]
                    
                    if mat_name not in materials_summary:
                        materials_summary[mat_name] = {"amount": 0, "icon": icon_url}
                    materials_summary[mat_name]["amount"] += amount

            # ==========================================
            # 4. 將 Summary 字典整理成前端漂亮的 List 格式
            # ==========================================
            final_list = []
            for mat_name, info in materials_summary.items():
                final_list.append({
                    "material_name": mat_name,
                    "total_required": info["amount"],
                    "material_icon": info["icon"]  # 把素材圖片一併吐給前端計算機
                })
                
            return JsonResponse({
                "status": "success", 
                "operator_id": op_id, 
                "total_materials_needed": final_list
            }, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[Calculator Error in views.py]: {e}")
        return JsonResponse({"status": "error", "message": "養成計算機運作異常"}, status=500)
    
# 11.【Create 新增】玩家註冊 API (對應 POST 請求)
@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "請求體不能為空且必須為合法 JSON"}, status=400)
            
        email = data.get('email')
        password = data.get('password')
        nickname = data.get('nickname')
        
        if not email or not password or not nickname:
            return JsonResponse({"status": "error", "message": "Email、密碼與暱稱皆為必填欄位"}, status=400)
            
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT user_id FROM user WHERE email = %s", [email])
                existing_user = cursor.fetchone()
                if existing_user:
                    return JsonResponse({"status": "error", "message": "該 Email 已被註冊"}, status=400)

                # 使用 Django 的 make_password 對密碼進行 Hash
                password_hash = make_password(password)
                
                sql_parent = "INSERT INTO user (email, password_hash) VALUES (%s, %s)"
                cursor.execute(sql_parent, [email, password_hash])

                new_user_id = cursor.lastrowid

                sql_child = "INSERT INTO reg_user (user_id, nickname) VALUES (%s, %s)"
                cursor.execute(sql_child, [new_user_id, nickname])
                
                return JsonResponse({"status": "success", "message": "註冊成功！歡迎加入羅德島", "user_id": new_user_id})
                
        except DatabaseError as e:
            print(f"[Register Error]: {e}")
            return JsonResponse({"status": "error", "message": "註冊失敗，資料庫寫入異常"}, status=500)


# 12.【Read 驗證】玩家登入 API (對應 POST 請求)
@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "請求體不能為空且必須為合法 JSON"}, status=400)
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({"status": "error", "message": "Email 與密碼不能為空"}, status=400)
            
        try:
            with connection.cursor() as cursor:
                sql_auth = "SELECT user_id, password_hash FROM user WHERE email = %s"
                cursor.execute(sql_auth, [email])
                user_record = cursor.fetchone()

                if not user_record:
                    return JsonResponse({"status": "error", "message": "帳號或密碼錯誤"}, status=400)
                    
                db_user_id = user_record[0]
                db_password_hash = user_record[1]

                # 使用 Django 的 check_password 驗證密碼
                if not check_password(password, db_password_hash):
                    return JsonResponse({"status": "error", "message": "帳號或密碼錯誤"}, status=400)

                sql_nickname = "SELECT nickname FROM reg_user WHERE user_id = %s"
                cursor.execute(sql_nickname, [db_user_id])
                profile_record = cursor.fetchone()

                # 檢查是否為管理員
                cursor.execute("SELECT user_id FROM admin WHERE user_id = %s", [db_user_id])
                is_admin = cursor.fetchone() is not None

                player_nickname = profile_record[0] if profile_record else "未知博士"
                
                return JsonResponse({
                    "status": "success",
                    "message": "登入成功",
                    "user_info": {
                        "user_id": db_user_id,
                        "email": email,
                        "nickname": player_nickname,
                        "is_admin": is_admin
                    }
                })
                
        except DatabaseError as e:
            print(f"[Login Error]: {e}")
            return JsonResponse({"status": "error", "message": "登入失敗，系統異常"}, status=500)

# 13.【Create 新增】新增關卡 API (對應 POST 請求)
@csrf_exempt
def create_stage(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "請求體不能為空且必須為合法 JSON"}, status=400)
            
        stage_id = data.get('stage_id')
        name = data.get('name')
        energy_cost = data.get('energy_cost')

        if not stage_id or not name or energy_cost is None:
            return JsonResponse({"status": "error", "message": "關卡代號(stage_id)、關卡名稱(name)與理智消耗(energy_cost)皆為必填欄位"}, status=400)
            
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT stage_id FROM stages WHERE stage_id = %s", [stage_id])
                if cursor.fetchone():
                    return JsonResponse({"status": "error", "message": f"關卡代號 '{stage_id}' 已經存在，請勿重複建立"}, status=400)
 
                sql = "INSERT INTO stages (stage_id, name, energy_cost) VALUES (%s, %s, %s)"

                cursor.execute(sql, [stage_id, name, energy_cost])
                
                return JsonResponse({"status": "success", "message": f"關卡 '{stage_id} - {name}' 成功建立！"})
                
        except DatabaseError as e:
            print(f"[Create Stage Error]: {e}")
            return JsonResponse({"status": "error", "message": "關卡建立失敗，資料庫寫入異常"}, status=500)

# 22.【Read 查詢】獲取系統全局數據統計
def get_global_stats(request):
    try:
        with connection.cursor() as cursor:
            # 統計幹員總數
            cursor.execute("SELECT COUNT(*) FROM operator")
            op_count = cursor.fetchone()[0]
            
            # 統計素材總數
            cursor.execute("SELECT COUNT(*) FROM material")
            mat_count = cursor.fetchone()[0]
            
            # 統計攻略總數
            cursor.execute("SELECT COUNT(*) FROM guides")
            guide_count = cursor.fetchone()[0]
            
            return JsonResponse({
                "status": "success",
                "counts": {
                    "operators": op_count,
                    "materials": mat_count,
                    "guides": guide_count
                }
            })
    except DatabaseError as e:
        print(f"[Stats Error]: {e}")
        return JsonResponse({"status": "error", "message": "無法取得統計數據"}, status=500)

# 14.【Read 查詢】查詢幹員列表 (支援頭像、標籤與各階最大數值陣列)
def get_operator_list(request):
    try:
        with connection.cursor() as cursor:
            # 1. 抓取所有幹員基礎資料與標籤 (補上 avatar_url，並為 class 加上反引號防呆)
            sql_ops = """
                SELECT 
                    o.operator_id, o.name, o.rarity, o.`class`, o.sex, o.branch, o.position, o.avatar_url,
                    GROUP_CONCAT(t.tag_name) as tags
                FROM operator o
                LEFT JOIN op_tag t ON o.operator_id = t.operator_id
                GROUP BY o.operator_id
            """
            cursor.execute(sql_ops)
            op_rows = cursor.fetchall()

            # 2. 抓取所有數值狀態
            sql_states = """
                SELECT operator_id, elite_stage, max_level, max_hp, max_atk, max_def, max_res, cost, stop_amount, deploy_cd, atk_cd
                FROM op_state
                ORDER BY operator_id, elite_stage
            """
            cursor.execute(sql_states)
            state_rows = cursor.fetchall()
            
            # 將狀態按 operator_id 分組
            states_by_op = {}
            for sr in state_rows:
                oid = sr[0]
                if oid not in states_by_op:
                    states_by_op[oid] = []
                states_by_op[oid].append({
                    "elite_stage": sr[1],
                    "max_level": sr[2],
                    "hp": sr[3],
                    "atk": sr[4],
                    "def": sr[5],
                    "res": sr[6],
                    "cost": sr[7],
                    "block": sr[8],
                    "redeploy": sr[9],
                    "atk_spd": sr[10]
                })

            # 3. 縫合資料並吐給前端
            result = []
            for r in op_rows:
                oid = r[0]
                result.append({
                    "operator_id": oid, 
                    "name": r[1], 
                    "rarity": r[2], 
                    "class": r[3],
                    "sex": r[4], 
                    "branch": r[5], 
                    "position": r[6],
                    "avatar_url": r[7],
                    "tags": r[8].split(',') if r[8] else [], 
                    "states": states_by_op.get(oid, [])
                })
                
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error in get_operator_list]: {e}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 15.【Read 查詢】查詢特定玩家持有的所有幹員練度清單 (對應 GET 請求)
def get_user_roster(request, user_id):
    try:
        with connection.cursor() as cursor:
            # 修正：同步 own 表的新欄位，包含目標練度與頭像
            sql = """
                SELECT o.operator_id, op.name, o.current_elite, o.current_level, o.target_elite, o.target_level, op.avatar_url
                FROM own o
                JOIN operator op ON o.operator_id = op.operator_id
                WHERE o.user_id = %s
            """
            cursor.execute(sql, [user_id])
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                roster_data = {
                    "operator_id": r[0],
                    "name": r[1],
                    "current_elite": r[2],
                    "current_level": r[3],
                    "target_elite": r[4],
                    "target_level": r[5],
                    "avatar_url": r[6]
                }
                result.append(roster_data)
                
            return JsonResponse({"status": "success", "user_id": user_id, "roster": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error]: {e}")
        return JsonResponse({"status": "error", "message": "無法取得玩家小隊資料"}, status=500)

# 16.【Create 新增】將幹員加入玩家持有清單 (對應 POST 請求)
@csrf_exempt
def add_to_roster(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            op_id = data.get('operator_id')

            if not user_id or not op_id:
                return JsonResponse({"status": "error", "message": "缺少 user_id 或 operator_id"}, status=400)

            with connection.cursor() as cursor:
                # 檢查是否已持有
                cursor.execute("SELECT user_id FROM own WHERE user_id = %s AND operator_id = %s", [user_id, op_id])
                if cursor.fetchone():
                    return JsonResponse({"status": "error", "message": "您已持有該幹員檔案"}, status=400)

                # 獲取稀有度以計算預設目標練度
                cursor.execute("SELECT rarity FROM operator WHERE operator_id = %s", [op_id])
                row = cursor.fetchone()
                if not row:
                    return JsonResponse({"status": "error", "message": "無效的幹員 ID"}, status=404)
                
                rarity = int(row[0])
                # 預設目標規則：
                # 6星: E2/90, 5星: E2/80, 4星: E2/70, 3星: E1/55
                target_elite = 2
                target_level = 90
                if rarity == 5: target_level = 80
                elif rarity == 4: target_level = 70
                elif rarity == 3: target_elite = 1; target_level = 55
                elif rarity <= 2: target_elite = 0; target_level = 30

                sql = """
                    INSERT INTO own (user_id, operator_id, current_elite, current_level, target_elite, target_level)
                    VALUES (%s, %s, 0, 1, %s, %s)
                """
                cursor.execute(sql, [user_id, op_id, target_elite, target_level])
                
                return JsonResponse({"status": "success", "message": "人事檔案已成功併入您的名冊"})
                
        except (DatabaseError, Exception) as e:
            print(f"[Add to Roster Error]: {e}")
            return JsonResponse({"status": "error", "message": "操作失敗，系統異常"}, status=500)

# 19.【Delete 刪除】將幹員從玩家持有清單中移除 (對應 DELETE 請求)
@csrf_exempt
def delete_from_roster(request, user_id, op_id):
    if request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                # 執行 DELETE 語法
                cursor.execute("DELETE FROM own WHERE user_id = %s AND operator_id = %s", [user_id, op_id])
                
                # 檢查是否有資料被刪除 (rowcount > 0)
                if cursor.rowcount == 0:
                    return JsonResponse({"status": "error", "message": "名冊中找不到該幹員，或是您無權限刪除"}, status=404)
                
                return JsonResponse({"status": "success", "message": "該幹員的人事檔案已從您的名冊中註銷"})
                
        except DatabaseError as e:
            print(f"[Delete Roster Error]: {e}")
            return JsonResponse({"status": "error", "message": "刪除失敗，資料庫操作異常"}, status=500)

# ==========================================
# 任務一相關 API
# ==========================================

# 健康檢查 API
def health_check(request):
    return JsonResponse({"status": "ok"})

# 系統狀態統計 API
def get_system_stats(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM operator")
            total_operators = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM material")
            total_materials = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM guides")
            total_guides = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM stages")
            total_stages = cursor.fetchone()[0]
            
            return JsonResponse({
                "status": "success",
                "data": {
                    "total_operators": total_operators,
                    "total_materials": total_materials,
                    "total_guides": total_guides,
                    "total_stages": total_stages
                }
            }, json_dumps_params={'ensure_ascii': False})
    except DatabaseError as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 管理員強制刪除留言 API
@csrf_exempt
def admin_delete_comment(request):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            guide_id = data.get('guide_id')
            comment_text = data.get('comment_text')
            
            if not guide_id or not comment_text:
                return JsonResponse({"status": "error", "message": "缺少 guide_id 或 comment_text"}, status=400)
                
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM guide_comment WHERE guide_id = %s AND comment_text = %s", [guide_id, comment_text])
                return JsonResponse({"status": "success", "message": "通訊紀錄已抹除"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 17.【Read 查詢】獲取特定用戶發布的攻略清單
def get_user_guides(request, user_id):
    try:
        with connection.cursor() as cursor:
            # 這裡模擬 status，若資料庫無 status 欄位可暫時預設 'published'
            sql = """
                SELECT guide_id, stage_id, title, created_at, 'published' as status 
                FROM guides 
                WHERE user_id = %s
                ORDER BY created_at DESC
            """
            cursor.execute(sql, [user_id])
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                result.append({
                    "id": r[0],
                    "stage_id": r[1],
                    "title": r[2],
                    "date": str(r[3]) if r[3] else None,
                    "status": r[4]
                })
                
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error]: {e}")
        return JsonResponse({"status": "error", "message": "無法讀取攻略紀錄"}, status=500)

# 17.5【Read 查詢】獲取全域攻略列表清單 (所有玩家)
def list_guides(request):
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT g.guide_id, g.stage_id, s.name as stage_name, g.title, u.nickname as author, g.created_at
                FROM guides g
                JOIN reg_user u ON g.user_id = u.user_id
                JOIN stages s ON g.stage_id = s.stage_id
                ORDER BY g.created_at DESC
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                result.append({
                    "guide_id": r[0],
                    "stage_id": r[1],
                    "stage_name": r[2],
                    "title": r[3],
                    "author": r[4],
                    "created_at": str(r[5]) if r[5] else None
                })
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
    except DatabaseError as e:
        print(f"[DB Error in list_guides]: {e}")
        return JsonResponse({"status": "error", "message": "無法讀取全域攻略清單"}, status=500)

# 18.【Create 新增】針對特定攻略發表留言 (對應 POST 請求))
@csrf_exempt
def create_guide_comment(request):
    if request.method == 'POST':
        try:
            # 防禦線一：解析前端傳入的 JSON Body
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "請求體不能為空且必須為合法 JSON"}, status=400)
            
        guide_id = data.get('guide_id')
        user_id = data.get('user_id')
        content = data.get('content')

        if not guide_id or not user_id or not content:
            return JsonResponse({"status": "error", "message": "攻略ID、用戶ID與留言內容皆為必填項目"}, status=400)
            
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO guide_comment (guide_id, user_id, comment_text) VALUES (%s, %s, %s)"

                cursor.execute(sql, [guide_id, user_id, content])
                
                return JsonResponse({"status": "success", "message": "留言發表成功！(已綁定用戶身分)"})
                
        except DatabaseError as e:
            print(f"[Comment Complete Error]: {e}")
            return JsonResponse({"status": "error", "message": "留言失敗，請確認用戶與攻略是否存在"}, status=500)
        
# 20.【Read 查詢】獲取素材圖鑑清單 (包含推薦掉落與需求統計)
def get_materials_list(request):
    try:
        with connection.cursor() as cursor:
            # 獲取基礎素材資料、最佳掉落關卡、以及需求幹員總數
            # 這裡的邏輯：
            # 1. 關聯 material 表
            # 2. LEFT JOIN stage_drop 並過濾出機率較高的關卡（機率排序：固定 > 大概率 > 中概率 > 小概率 > 罕見）
            # 3. 統計 op_material 中有多少名不重複的 operator_id
            sql = """
                SELECT 
                    m.material_id, 
                    m.name,
                    m.icon_url,
                    sd.stage_id,
                    s.name as stage_name,
                    sd.drop_rate,
                    s.energy_cost,
                    (SELECT COUNT(DISTINCT operator_id) FROM op_material WHERE material_id = m.material_id) as op_count
                FROM material m
                LEFT JOIN (
                    -- 子查詢獲取每個素材機率最高的一筆關卡
                    SELECT stage_id, material_id, drop_rate
                    FROM stage_drop
                    WHERE (material_id, 
                           CASE drop_rate 
                               WHEN '固定' THEN 5 
                               WHEN '大概率' THEN 4 
                               WHEN '中概率' THEN 3 
                               WHEN '小概率' THEN 2 
                               WHEN '罕見' THEN 1 
                           END) IN (
                        SELECT material_id, MAX(
                           CASE drop_rate 
                               WHEN '固定' THEN 5 
                               WHEN '大概率' THEN 4 
                               WHEN '中概率' THEN 3 
                               WHEN '小概率' THEN 2 
                               WHEN '罕見' THEN 1 
                           END)
                        FROM stage_drop
                        GROUP BY material_id
                    )
                ) sd ON m.material_id = sd.material_id
                LEFT JOIN stages s ON sd.stage_id = s.stage_id
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                result.append({
                    "id": r[0],
                    "name": r[1],
                    "icon_url": r[2],
                    "best_stage": {
                        "id": r[3],
                        "name": r[4],
                        "drop_rate": r[5],
                        "ap_cost": r[6]
                    } if r[3] else None,
                    "usage_count": r[7] or 0
                })
                
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[Materials List Error]: {e}")
        return JsonResponse({"status": "error", "message": "素材資料讀取失敗"}, status=500)

# 21.【Read 查詢】獲取特定素材的詳細消耗報告 (哪些幹員需要、在哪個階段、需要多少)
def get_material_usage_detail(request, material_id):
    try:
        with connection.cursor() as cursor:
            # 1. 查詢精英化需求
            sql_elite = """
                SELECT o.name, om.elite_stage, om.amount
                FROM op_material om
                JOIN operator o ON om.operator_id = o.operator_id
                WHERE om.material_id = %s
                ORDER BY om.elite_stage DESC
            """
            cursor.execute(sql_elite, [material_id])
            elite_reqs = [{"name": r[0], "type": f"精英化階段 {r[1]}", "amount": r[2]} for r in cursor.fetchall()]

            # 2. 查詢技能升級需求
            sql_skill = """
                SELECT o.name, s.skill_name, sm.level, sm.amount
                FROM skill_material sm
                JOIN skill s ON sm.skill_id = S.skill_id
                JOIN operator o ON s.op_id = o.operator_id
                WHERE sm.material_id = %s
                ORDER BY sm.level DESC
            """
            cursor.execute(sql_skill, [material_id])
            skill_reqs = [{"name": r[0], "type": f"技能 [{r[1]}] LV.{r[2]}", "amount": r[3]} for r in cursor.fetchall()]

            # 3. 查詢模組需求
            sql_module = """
                SELECT o.name, m.name as module_name, mm.level, mm.amount
                FROM module_material mm
                JOIN module m ON mm.module_id = m.module_id
                JOIN operator o ON m.operator_id = o.operator_id
                WHERE mm.material_id = %s
                ORDER BY mm.level DESC
            """
            cursor.execute(sql_module, [material_id])
            module_reqs = [{"name": r[0], "type": f"模組 [{r[1]}] 等級 {r[2]}", "amount": r[3]} for r in cursor.fetchall()]

            return JsonResponse({
                "status": "success",
                "material_id": material_id,
                "usage": {
                    "elite": elite_reqs,
                    "skill": skill_reqs,
                    "module": module_reqs
                }
            }, json_dumps_params={'ensure_ascii': False})

    except DatabaseError as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 17.【Delete 刪除】刪除特定攻略留言 (對應 DELETE 請求)
@csrf_exempt
def delete_guide_comment(request, guide_id):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "請求體不能為空且必須為合法 JSON"}, status=400)
            
        comment_text = data.get('content')
        
        if not comment_text:
            return JsonResponse({"status": "error", "message": "必須提供欲刪除的留言內容(content)"}, status=400)
            
        try:
            with connection.cursor() as cursor:
                sql_check = "SELECT guide_id FROM guide_comment WHERE guide_id = %s AND comment_text = %s"
                cursor.execute(sql_check, [guide_id, comment_text])
                
                if not cursor.fetchone():
                    return JsonResponse({"status": "error", "message": "找不到該關卡對應的留言內容，無法刪除"}, status=404)

                sql_delete = "DELETE FROM guide_comment WHERE guide_id = %s AND comment_text = %s"
                cursor.execute(sql_delete, [guide_id, comment_text])
                
                return JsonResponse({"status": "success", "message": "留言已成功刪除"})
                
        except DatabaseError as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "不支援此連線方法"}, status=405)

# ==========================================
# 管理員專用：CRUD 擴充
# ==========================================

# 27.【Create】管理員新增幹員
@csrf_exempt
def admin_create_operator(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # 基本驗證
            name = data.get('name')
            rarity = data.get('rarity')
            op_class = data.get('class')
            branch = data.get('branch')
            position = data.get('position')
            sex = data.get('sex')

            if not all([name, rarity, op_class, branch, position, sex]):
                return JsonResponse({"status": "error", "message": "欄位不完整"}, status=400)

            with connection.cursor() as cursor:
                sql = "INSERT INTO operator (name, rarity, `class`, branch, position, sex, avatar_url, portrait_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                cursor.execute(sql, [name, rarity, op_class, branch, position, sex, data.get('avatar_url'), data.get('portrait_url')])
                return JsonResponse({"status": "success", "message": f"幹員 {name} 已錄入資料庫"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 28.【Delete】管理員刪除幹員
@csrf_exempt
def admin_delete_operator(request, op_id):
    if request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM operator WHERE operator_id = %s", [op_id])
                return JsonResponse({"status": "success", "message": "幹員檔案已徹底抹除"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 29.【Create】管理員新增素材
@csrf_exempt
def admin_create_material(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            icon_url = data.get('icon_url')
            if not name: return JsonResponse({"status": "error", "message": "名稱缺失"}, status=400)

            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO material (name, icon_url) VALUES (%s, %s)", [name, icon_url])
                return JsonResponse({"status": "success", "message": f"素材 {name} 已新增"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 30.【Delete】管理員刪除素材
@csrf_exempt
def admin_delete_material(request, mat_id):
    if request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM material WHERE material_id = %s", [mat_id])
                return JsonResponse({"status": "success", "message": "素材已從倉庫移除"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 31.【Delete】管理員刪除關卡
@csrf_exempt
def admin_delete_stage(request, stage_id):
    if request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM stages WHERE stage_id = %s", [stage_id])
                return JsonResponse({"status": "success", "message": f"作戰區域 {stage_id} 已撤鎖"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 18.【Read 查詢】查詢特定幹員詳細資料 (支援立繪與頭像)
def get_operator_detail(request, op_id):
    try:
        with connection.cursor() as cursor:
            # ==========================================
            # 1. 基礎資料 (Operator 基本屬性 + 頭像 + 立繪)
            # ==========================================
            # 補上 avatar_url 與 portrait_url，並為 class 加上反引號防呆
            sql_basic = "SELECT operator_id, name, rarity, `class`, sex, branch, position, avatar_url, portrait_url FROM operator WHERE operator_id = %s"
            cursor.execute(sql_basic, [op_id])
            basic_row = cursor.fetchone()
            
            # 防禦機制：如果亂打網址 ID 找不到幹員，回傳 404
            if not basic_row:
                return JsonResponse({"status": "error", "message": "找不到該幹員的人事檔案"}, status=404)
            
            # 初始化回傳用的字典
            operator = {
                "id": basic_row[0],
                "name": basic_row[1],
                "rarity": int(basic_row[2]) if basic_row[2] else 1,
                "class": basic_row[3],
                "sex": basic_row[4],
                "branch": basic_row[5],
                "position": basic_row[6],
                "avatar_url": basic_row[7],    
                "portrait_url": basic_row[8]  
            }

            # ==========================================
            # 2. 數值區間 (對齊最新 op_state 結構)
            # ==========================================
            sql_stats = """
                SELECT elite_stage, max_level, min_hp, max_hp, min_atk, max_atk, min_def, max_def, min_res, max_res,
                       cost, stop_amount, deploy_cd, atk_cd
                FROM op_state 
                WHERE operator_id = %s 
                ORDER BY elite_stage ASC
            """
            cursor.execute(sql_stats, [op_id])
            stats_rows = cursor.fetchall()
            
            operator["all_stats"] = []
            for r in stats_rows:
                operator["all_stats"].append({
                    "elite_stage": r[0],
                    "min_level": 1,        
                    "max_level": r[1],
                    "hp_range": {"min": r[2], "max": r[3]},
                    "atk_range": {"min": r[4], "max": r[5]},
                    "def_range": {"min": r[6], "max": r[7]},
                    "res_range": {"min": r[8], "max": r[9]},
                    "cost": r[10],         # 部署費用
                    "block": r[11],        # 阻擋數
                    "redeploy": r[12],     # 再部署時間
                    "atk_spd": r[13]       # 攻擊間隔
                })
            
            # 貼心設計：準備一組「該幹員目前最高練度」的預設數值給前端直接顯示
            operator["stats"] = {
                "elite": stats_rows[-1][0] if stats_rows else 0,
                "level": stats_rows[-1][1] if stats_rows else 1,
                "hp": stats_rows[-1][3] if stats_rows else 0,
                "atk": stats_rows[-1][5] if stats_rows else 0,
                "def": stats_rows[-1][7] if stats_rows else 0,
                "res": stats_rows[-1][9] if stats_rows else 0,
                "cost": stats_rows[-1][10] if stats_rows else 0,
                "block": stats_rows[-1][11] if stats_rows else 0,
                "redeploy": stats_rows[-1][12] if stats_rows else 0,
                "atk_spd": stats_rows[-1][13] if stats_rows else 0
            } if stats_rows else None

            # ==========================================
            # 3. 標籤 (Tags)
            # ==========================================
            cursor.execute("SELECT tag_name FROM op_tag WHERE operator_id = %s", [op_id])
            operator["tags"] = [row[0] for row in cursor.fetchall()]

            # ==========================================
            # 4. 檔案資料 (Profile 背景故事與聲優)
            # ==========================================
            sql_profile = "SELECT illustrator, voice_actor, lore_text FROM operator_profile WHERE operator_id = %s"
            cursor.execute(sql_profile, [op_id])
            p_row = cursor.fetchone()
            if p_row:
                operator["profile"] = {
                    "illustrator": p_row[0],
                    "voice_actor": p_row[1],
                    "lore": p_row[2]
                }
            else:
                operator["profile"] = None

            # ==========================================
            # 5. 技能 (Skills) - 包含圖片 URL
            # ==========================================
            sql_skill = "SELECT skill_id, skill_name, skill_profile, icon_url FROM skill WHERE op_id = %s"
            cursor.execute(sql_skill, [op_id])
            operator["skills"] = [
                {"id": row[0], "name": row[1], "description": row[2], "icon_url": row[3]} 
                for row in cursor.fetchall()
            ]

            # ==========================================
            # 6. 模組 (Modules) - 包含圖片 URL 與素材需求
            # ==========================================
            sql_module = "SELECT module_id, module_type, unlock_mission, icon_url FROM module WHERE operator_id = %s"
            cursor.execute(sql_module, [op_id])
            module_rows = cursor.fetchall()
            
            operator["modules"] = []
            for m_row in module_rows:
                mid = m_row[0]
                # 抓取該模組各等級所需素材
                sql_m_mat = """
                    SELECT mm.level, m.name, mm.amount, m.icon_url
                    FROM module_material mm
                    JOIN material m ON mm.material_id = m.material_id
                    WHERE mm.module_id = %s
                    ORDER BY mm.level ASC
                """
                cursor.execute(sql_m_mat, [mid])
                m_mat_rows = cursor.fetchall()
                
                materials_by_level = {}
                for mmr in m_mat_rows:
                    lv = mmr[0]
                    if lv not in materials_by_level:
                        materials_by_level[lv] = []
                    materials_by_level[lv].append({
                        "name": mmr[1],
                        "amount": mmr[2],
                        "icon": mmr[3]
                    })
                
                operator["modules"].append({
                    "id": mid,
                    "type": m_row[1],
                    "mission": m_row[2],
                    "icon_url": m_row[3],
                    "materials": materials_by_level
                })

            # 最終組裝回傳
            return JsonResponse({"status": "success", "data": operator}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        # 在後台印出真實錯誤，前台回傳 500 保護系統
        print(f"[DB Error in get_operator_detail]: {e}")
        return JsonResponse({"status": "error", "message": "資料庫讀取失敗，請聯絡系統管理員"}, status=500)
    
# 21.【Compute 計算】動態等級數值預測：線性插值計算機
def get_interp_stats(request, op_id):
    try:
        target_elite = int(request.GET.get('elite', 0))
        target_level = int(request.GET.get('level', 1))

        with connection.cursor() as cursor:
            # 撈出範圍與固定數值
            sql = """
                SELECT max_level, min_hp, max_hp, min_atk, max_atk, min_def, max_def, min_res, max_res,
                       cost, stop_amount, deploy_cd, atk_cd
                FROM op_state
                WHERE operator_id = %s AND elite_stage = %s
            """
            cursor.execute(sql, [op_id, target_elite])
            row = cursor.fetchone()

            if not row:
                return JsonResponse({"status": "error", "message": "找不到該精階的基礎數值紀錄"}, status=404)

            max_lvl = row[0]
            min_lvl = 1 
            min_hp, max_hp = row[1], row[2]
            min_atk, max_atk = row[3], row[4]
            min_def, max_def = row[5], row[6]
            min_res, max_res = row[7], row[8]
            
            # 取得該精階的固定數值 (不需要插值)
            static_cost, static_block, static_redeploy, static_atk_spd = row[9], row[10], row[11], row[12]

            # 線性插值計算
            if target_level <= min_lvl:
                res_hp, res_atk, res_def, res_res = min_hp, min_atk, min_def, min_res
            elif target_level >= max_lvl:
                res_hp, res_atk, res_def, res_res = max_hp, max_atk, max_def, max_res
            else:
                ratio = (target_level - min_lvl) / (max_lvl - min_lvl)
                res_hp = round(min_hp + ratio * (max_hp - min_hp))
                res_atk = round(min_atk + ratio * (max_atk - min_atk))
                res_def = round(min_def + ratio * (max_def - min_def))
                res_res = round(min_res + ratio * (max_res - min_res))

            return JsonResponse({
                "status": "success",
                "operator_id": op_id,
                "elite_stage": target_elite,
                "level": target_level,
                "interpolated_stats": {
                    "hp": res_hp,
                    "atk": res_atk,
                    "def": res_def,
                    "res": res_res,
                    "cost": static_cost,         # 👈 直接原封不動吐給前端
                    "block": static_block,       # 👈 直接原封不動吐給前端
                    "redeploy": static_redeploy, # 👈 直接原封不動吐給前端
                    "atk_spd": static_atk_spd    # 👈 直接原封不動吐給前端
                }
            }, json_dumps_params={'ensure_ascii': False})

    except DatabaseError as e:
        print(f"[Interpolation Error]: {e}")
        return JsonResponse({"status": "error", "message": "數值插值計算異常"}, status=500)

# 22.【Compute & Update】預估養成升級計算機
@csrf_exempt
def calc_upgrade_plan(request, user_id, op_id):
    try:
        curr_elite = int(request.GET.get('curr_elite', 0))
        curr_level = int(request.GET.get('curr_level', 1))
        targ_elite = int(request.GET.get('targ_elite', 2))
        targ_level = int(request.GET.get('targ_level', 90))

        DROP_RATE_MAP = {
            '固定': 1.0,
            '大概率': 0.6,
            '中概率': 0.3,
            '小概率': 0.15,
            '罕見': 0.05
        }

        with connection.cursor() as cursor:
            # 1. 更新玩家練度進度
            sql_update = """
                UPDATE own 
                SET current_elite = %s, current_level = %s, target_elite = %s, target_level = %s 
                WHERE user_id = %s AND operator_id = %s
            """
            cursor.execute(sql_update, [curr_elite, curr_level, targ_elite, targ_level, user_id, op_id])

            # 2. 聚合精英化素材需求
            # 我們搜尋區間： elite_stage > curr_elite 且 <= targ_elite
            sql_materials = """
                SELECT m.material_id, m.name, m.icon_url, SUM(om.amount) as total_amount
                FROM op_material om
                JOIN material m ON om.material_id = m.material_id
                WHERE om.operator_id = %s AND om.elite_stage > %s AND om.elite_stage <= %s
                GROUP BY m.material_id, m.name, m.icon_url
            """
            cursor.execute(sql_materials, [op_id, curr_elite, targ_elite])
            mat_rows = cursor.fetchall()

            result_materials = []
            for m_row in mat_rows:
                mat_id, mat_name, mat_icon, amount = m_row
                amount = int(amount) if amount else 0
                
                # 3. 尋找最佳掉落關卡
                # 邏輯：找該素材機率最高的一筆 (利用 CASE 排序機率)
                sql_best_stage = """
                    SELECT sd.stage_id, s.energy_cost, sd.drop_rate
                    FROM stage_drop sd
                    JOIN stages s ON sd.stage_id = s.stage_id
                    WHERE sd.material_id = %s
                    ORDER BY 
                        CASE sd.drop_rate 
                            WHEN '固定' THEN 5 
                            WHEN '大概率' THEN 4 
                            WHEN '中概率' THEN 3 
                            WHEN '小概率' THEN 2 
                            WHEN '罕見' THEN 1 
                        END DESC
                    LIMIT 1
                """
                cursor.execute(sql_best_stage, [mat_id])
                stage_row = cursor.fetchone()

                best_stage_info = None
                if stage_row:
                    s_id, s_energy, s_rate = stage_row
                    prob = float(DROP_RATE_MAP.get(s_rate, 0.01))
                    
                    # 確保所有運算子類型一致，避免 Decimal vs float 錯誤
                    expected_runs = round(float(amount) / prob, 1)
                    expected_energy = round(expected_runs * float(s_energy))
                    
                    best_stage_info = {
                        "stage_id": s_id,
                        "energy_cost": int(s_energy),
                        "drop_rate": s_rate,
                        "expected_runs": float(expected_runs),
                        "expected_energy": int(expected_energy)
                    }

                result_materials.append({
                    "material_id": mat_id,
                    "name": mat_name,
                    "icon": mat_icon,
                    "amount": amount,
                    "best_stage": best_stage_info
                })

            return JsonResponse({
                "status": "success",
                "user_id": user_id,
                "operator_id": op_id,
                "upgrade_path": {
                    "from": f"E{curr_elite}/LV{curr_level}",
                    "to": f"E{targ_elite}/LV{targ_level}"
                },
                "total_materials": result_materials
            }, json_dumps_params={'ensure_ascii': False})

    except DatabaseError as e:
        print(f"[Calc Upgrade Error]: {e}")
        return JsonResponse({"status": "error", "message": "升級計畫計算失敗"}, status=500)
    except Exception as e:
        print(f"[General Error]: {e}")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

# 23.【Read】獲取單篇攻略詳情與留言
def get_guide_detail(request, guide_id):
    try:
        with connection.cursor() as cursor:
            # 1. 獲取攻略主體資訊 (JOIN 作者與關卡)
            sql_guide = """
                SELECT g.guide_id, g.title, g.content, g.created_at, u.nickname, 
                       s.stage_id, s.name as stage_name, s.energy_cost, g.user_id
                FROM guides g
                JOIN reg_user u ON g.user_id = u.user_id
                JOIN stages s ON g.stage_id = s.stage_id
                WHERE g.guide_id = %s
            """
            cursor.execute(sql_guide, [guide_id])
            guide_row = cursor.fetchone()

            if not guide_row:
                return JsonResponse({"status": "error", "message": "戰術日誌不存在"}, status=404)

            # 2. 獲取該篇攻略的所有留言 (JOIN 留言者)
            sql_comments = """
                SELECT c.comment_text, u.nickname, u.user_id
                FROM guide_comment c
                JOIN reg_user u ON c.user_id = u.user_id
                WHERE c.guide_id = %s
            """
            cursor.execute(sql_comments, [guide_id])
            comment_rows = cursor.fetchall()

            comments = []
            for c in comment_rows:
                comments.append({
                    "text": c[0],
                    "nickname": c[1],
                    "user_id": c[2]
                })

            data = {
                "guide_id": guide_row[0],
                "title": guide_row[1],
                "content": guide_row[2],
                "created_at": str(guide_row[3]),
                "author_nickname": guide_row[4],
                "stage_id": guide_row[5],
                "stage_name": guide_row[6],
                "energy_cost": guide_row[7],
                "author_id": guide_row[8],
                "comments": comments
            }

            return JsonResponse({"status": "success", "data": data}, json_dumps_params={'ensure_ascii': False})

    except DatabaseError as e:
        print(f"[Guide Detail Error]: {e}")
        return JsonResponse({"status": "error", "message": "讀取日誌失敗"}, status=500)

# 24.【Create】新增留言 (指名攻略 ID)
@csrf_exempt
def post_guide_comment(request, guide_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            comment_text = data.get('comment_text') # 根據題目要求名稱為 comment_text

            if not user_id or not comment_text:
                return JsonResponse({"status": "error", "message": "留言內容與使用者ID不可為空"}, status=400)

            with connection.cursor() as cursor:
                sql = "INSERT INTO guide_comment (guide_id, user_id, comment_text) VALUES (%s, %s, %s)"
                cursor.execute(sql, [guide_id, user_id, comment_text])
                
            return JsonResponse({"status": "success", "message": "通訊已送達 // 留言成功"})

        except DatabaseError as e:
            print(f"[Comment Post Error]: {e}")
            return JsonResponse({"status": "error", "message": "發送失敗"}, status=500)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Invalid method"}, status=405)

# 25.【Read 查詢】全域搜尋系統 (對應 GET 請求)
# 目的：一次搜尋幹員、攻略、以及關卡，並回傳統一格式結果
def global_search(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({"status": "success", "results": []})

    try:
        results = []
        with connection.cursor() as cursor:
            # 1. 搜尋幹員 (以名稱為主)
            sql_ops = "SELECT operator_id, name, rarity, class FROM operator WHERE name LIKE %s LIMIT 8"
            cursor.execute(sql_ops, [f'%{query}%'])
            for r in cursor.fetchall():
                results.append({
                    "type": "operator",
                    "id": r[0],
                    "title": r[1],
                    "subtitle": f"{r[2]}星 {r[3]}",
                    "url": f"/operator/{r[0]}"
                })

            # 2. 搜尋攻略
            sql_guides = "SELECT guide_id, title, stage_id FROM guides WHERE title LIKE %s LIMIT 8"
            cursor.execute(sql_guides, [f'%{query}%'])
            for r in cursor.fetchall():
                results.append({
                    "type": "guide",
                    "id": r[0],
                    "title": r[1],
                    "subtitle": f"玩家攻略 - 關卡: {r[2]}",
                    "url": f"/guide_detail.html?id={r[0]}"
                })
            
            # 3. 搜尋關卡
            sql_stages = "SELECT stage_id, name FROM stages WHERE stage_id LIKE %s OR name LIKE %s LIMIT 5"
            cursor.execute(sql_stages, [f'%{query}%', f'%{query}%'])
            for r in cursor.fetchall():
                results.append({
                    "type": "stage",
                    "id": r[0],
                    "title": r[1] if r[1] else r[0],
                    "subtitle": f"行動代碼: {r[0]}",
                    "url": f"/stage_detail.html?id={r[0]}"
                })

        return JsonResponse({"status": "success", "results": results}, json_dumps_params={'ensure_ascii': False})
    except DatabaseError as e:
        print(f"[Global Search Error]: {e}")
        return JsonResponse({"status": "error", "message": "搜尋服務暫時不可用"}, status=500)

# 26.【Read 查詢】查詢單一關卡詳細資料
def get_stage_detail(request, stage_id):
    try:
        with connection.cursor() as cursor:
            # 獲取關卡基本資料
            cursor.execute("SELECT stage_id, name, energy_cost, map_url, description FROM stages WHERE stage_id = %s", [stage_id])
            row = cursor.fetchone()
            
            if not row:
                return JsonResponse({"status": "error", "message": "找不到該關卡資料"}, status=404)
                
            stage_data = {
                "id": row[0],
                "name": row[1],
                "cost": row[2],
                "map_url": row[3],
                "description": row[4]
            }
            
            return JsonResponse({"status": "success", "data": stage_data}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error in get_stage_detail]: {e}")
        return JsonResponse({"status": "error", "message": "讀取關卡詳情失敗"}, status=500)

# 27.【Admin 錄入】全功能幹員檔案錄入 (事務控制)
@csrf_exempt
def create_full_operator(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)
    
    try:
        data = json.loads(request.body)
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Operator 核心表
                op_sql = """
                    INSERT INTO operator (name, rarity, class, branch, position, sex, image_url, avatar_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(op_sql, [
                    data.get('name'), data.get('rarity'), data.get('class'), data.get('branch'),
                    data.get('position'), data.get('sex'), data.get('image_url'), data.get('avatar_url')
                ])
                op_id = cursor.lastrowid
                
                # 2. profile
                prof_sql = "INSERT INTO operator_profile (operator_id, illustrator, voice_actor, profile_text) VALUES (%s, %s, %s, %s)"
                cursor.execute(prof_sql, [op_id, data.get('illustrator'), data.get('voice_actor'), data.get('profile_text')])
                
                # 3. tags
                if 'tags' in data and data['tags']:
                    tag_sql = "INSERT INTO op_tag (operator_id, tag_name) VALUES (%s, %s)"
                    for tag in data['tags']:
                        if tag.strip(): cursor.execute(tag_sql, [op_id, tag.strip()])
                
                # 4. states
                if 'states' in data and data['states']:
                    state_sql = """
                        INSERT INTO op_state (operator_id, elite_level, max_level, hp, atk, def, res, redeploy_time, cost, block_count, atk_speed)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    for state in data['states']:
                        cursor.execute(state_sql, [
                            op_id, state.get('elite'), state.get('max_level'), 
                            state.get('hp'), state.get('atk'), state.get('def'), state.get('res'),
                            state.get('redeploy'), state.get('cost'), state.get('block'), state.get('atk_speed')
                        ])
                
                # 5. materials
                if 'materials' in data and data['materials']:
                    mat_sql = "INSERT INTO op_material (operator_id, elite_level, material_id, count) VALUES (%s, %s, %s, %s)"
                    for m in data['materials']:
                        cursor.execute(mat_sql, [op_id, m.get('elite'), m.get('material_id'), m.get('count')])
                
                # 6. skills
                if 'skills' in data and data['skills']:
                    for sk in data['skills']:
                        sk_sql = "INSERT INTO skill (operator_id, name, profile, icon_url) VALUES (%s, %s, %s, %s)"
                        cursor.execute(sk_sql, [op_id, sk.get('name'), sk.get('description'), sk.get('icon')])
                        sk_id = cursor.lastrowid
                        if 'materials' in sk and sk['materials']:
                            sk_mat_sql = "INSERT INTO skill_material (skill_id, mastery_level, material_id, count) VALUES (%s, %s, %s, %s)"
                            for sm in sk['materials']:
                                cursor.execute(sk_mat_sql, [sk_id, sm.get('mastery'), sm.get('material_id'), sm.get('count')])
                
                # 7. modules
                if 'modules' in data and data['modules']:
                    for mod in data['modules']:
                        mod_sql = "INSERT INTO module (operator_id, name, type, mission_text, icon_url) VALUES (%s, %s, %s, %s, %s)"
                        cursor.execute(mod_sql, [op_id, mod.get('name'), mod.get('type'), mod.get('mission'), mod.get('icon')])
                        mod_id = cursor.lastrowid
                        if 'materials' in mod and mod['materials']:
                            mod_mat_sql = "INSERT INTO module_material (module_id, level, material_id, count) VALUES (%s, %s, %s, %s)"
                            for mm in mod['materials']:
                                cursor.execute(mod_mat_sql, [mod_id, mm.get('level'), mm.get('material_id'), mm.get('count')])
                                
        return JsonResponse({"status": "success", "message": f"幹員 {data.get('name')} 資料已成功同步 (ID: {op_id})"}, json_dumps_params={'ensure_ascii': False})
    except Exception as e:
        print(f"[Admin Error]: {str(e)}")
        return JsonResponse({"status": "error", "message": f"資料寫入失敗: {str(e)}"}, status=500)

