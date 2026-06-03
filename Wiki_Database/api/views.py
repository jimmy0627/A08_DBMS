from django.db import connection, DatabaseError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# 1.【Read 查詢】查詢所有關卡清單 (對應 GET 請求)
def get_stages(request):
    try:
        # 使用 with 語法開啟資料庫游標，確保執行完畢後自動釋放資源
        with connection.cursor() as cursor:
            # 執行基本的 SELECT 查詢，無外部參數
            cursor.execute("SELECT stage_id, name, energy_cost FROM Stages")
            rows = cursor.fetchall() # 撈取所有符合的資料列
            
            # 將資料庫回傳的 Tuple 格式，轉換為前端易讀的 JSON (List of Dictionaries)
            result = [{"id": r[0], "name": r[1], "cost": r[2]} for r in rows]
            
            # ensure_ascii=False 確保回傳的中文不會變成 Unicode 亂碼
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        # 捕捉並處理資料庫異常，回傳 HTTP 500 避免伺服器崩潰
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

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
            
    except DatabaseError as e:
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
# 目的：拉出該幹員所有技能專三所需的材料清單
def get_skill_materials(request, op_id):
    try:
        with connection.cursor() as cursor:
            # 關聯 skill (技能表) 與 skill_material (專精材料中介表) 及 material (素材表)
            sql = """
                SELECT S.skill_name, M.name, SM.amount
                FROM skill_material SM
                JOIN skill S ON SM.skill_id = S.skill_id
                JOIN material M ON SM.material_id = M.material_id
                WHERE S.op_id = %s
            """
            cursor.execute(sql, [op_id])
            rows = cursor.fetchall()

            result = []
            for r in rows:
                item = {
                    "skill_name": r[0],
                    "material_name": r[1],
                    "amount": r[2]
                }
                result.append(item)
                
            return JsonResponse({"status": "success", "operator_id": op_id, "skills": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error] {e}")
        return JsonResponse({"status": "error", "message": "查詢技能素材失敗"}, status=500)


# 9.【Read 查詢】查詢特定幹員的模組升級素材 (對應 GET 請求)
# 目的：拉出該幹員專屬模組解鎖所需的材料清單
def get_module_materials(request, op_id):
    try:
        with connection.cursor() as cursor:
            # 關聯 module (模組表) 與 module_material (模組材料中介表) 及 material (素材表)
            sql = """
                SELECT MO.module_type, MO.unlock_mission, M.name, MM.amount
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
                    "module_type": r[0],
                    "unlock_mission": r[1],
                    "material_name": r[2],
                    "amount": r[3]
                }
                result.append(item)
                
            return JsonResponse({"status": "success", "operator_id": op_id, "modules": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error] {e}")
        return JsonResponse({"status": "error", "message": "查詢模組素材失敗"}, status=500)


# 10.【Compute 計算】核心養成計算機：一鍵計算幹員「總素材消耗總計」（對應 GET/POST 請求）
# 目的：一鍵將某位幹員（精英化 + 技能專三 + 模組）的所有素材在後端進行加總聚合
def calculate_operator_total_costs(request, op_id):
    try:
        with connection.cursor() as cursor:
            materials_summary = {}

            cursor.execute("SELECT M.name, SUM(OM.amount) FROM op_material OM JOIN material M ON OM.material_id = M.material_id WHERE OM.operator_id = %s GROUP BY M.name", [op_id])
            for r in cursor.fetchall():
                name, amount = r[0], int(r[1])
                if name not in materials_summary:
                    materials_summary[name] = 0
                materials_summary[name] += amount

            cursor.execute("SELECT M.name, SUM(SM.amount) FROM skill_material SM JOIN skill S ON SM.skill_id = S.skill_id JOIN material M ON SM.material_id = M.material_id WHERE S.op_id = %s GROUP BY M.name", [op_id])
            for r in cursor.fetchall():
                name, amount = r[0], int(r[1])
                if name not in materials_summary:
                    materials_summary[name] = 0
                materials_summary[name] += amount

            cursor.execute("SELECT M.name, SUM(MM.amount) FROM module_material MM JOIN module MO ON MM.module_id = MO.module_id JOIN material M ON MM.material_id = M.material_id WHERE MO.operator_id = %s GROUP BY M.name", [op_id])
            for r in cursor.fetchall():
                name, amount = r[0], int(r[1])
                if name not in materials_summary:
                    materials_summary[name] = 0
                materials_summary[name] += amount

            final_list = []
            for mat_name, total_amount in materials_summary.items():
                final_list.append({
                    "material_name": mat_name,
                    "total_required": total_amount
                })
                
            return JsonResponse({"status": "success", "operator_id": op_id, "total_materials_needed": final_list}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[Calculator Error] {e}")
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

                sql_parent = "INSERT INTO user (email, password_hash) VALUES (%s, %s)"
                cursor.execute(sql_parent, [email, password])

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

                if password != db_password_hash:
                    return JsonResponse({"status": "error", "message": "帳號或密碼錯誤"}, status=400)

                sql_nickname = "SELECT nickname FROM reg_user WHERE user_id = %s"
                cursor.execute(sql_nickname, [db_user_id])
                profile_record = cursor.fetchone()

                player_nickname = profile_record[0] if profile_record else "未知博士"
                
                return JsonResponse({
                    "status": "success",
                    "message": "登入成功",
                    "user_info": {
                        "user_id": db_user_id,
                        "email": email,
                        "nickname": player_nickname
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


def get_operator_list(request):
    try:
        with connection.cursor() as cursor:
            # 修正 1：全部改為小寫 (包含資料表與 WHERE 條件)
            # 修正 2：將 o.class 加上反引號 o.`class` 避免保留字衝突
            sql = """
SELECT 
                    o.operator_id, 
                    o.name, 
                    o.rarity, 
                    o.`class`, 
                    o.sex, 
                    o.branch, 
                    o.position,
                    s.hp, 
                    s.atk, 
                    s.def, 
                    s.cost, 
                    s.stop_amount, 
                    s.deploy_cd, 
                    s.atk_cd,
                    s.res
                FROM operator o
                LEFT JOIN op_state s ON o.operator_id = s.operator_id
                WHERE s.elite = 2 AND s.level = 90
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                op_data = {
                    "operator_id": r[0],
                    "name": r[1],
                    "rarity": r[2],
                    "class": r[3],
                    "sex": r[4],
                    "branch": r[5],
                    "position": r[6],
                    "hp": r[7],
                    "atk": r[8],
                    "def": r[9],
                    "cost": r[10],
                    "block": r[11],
                    "redeploy": r[12],
                    "atk_spd": r[13],
                    "res": r[14] 
                }
                result.append(op_data)
                
            return JsonResponse({
                "status": "success", 
                "data": result
            }, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        # 強烈建議：如果再報錯，請查看終端機印出的這行錯誤訊息
        # 它會明確告訴你是哪個欄位或語法出錯
        print(f"========== [資料庫 SQL 錯誤] ==========\n{e}\n=======================================")
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
    
# 15.【Read 查詢】查詢特定玩家持有的所有幹員練度清單 (對應 GET 請求)
def get_user_roster(request, user_id):
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT o.operator_id, op.name, o.current_elite, o.current_level 
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
                    "current_level": r[3]
                }
                result.append(roster_data)
                
            return JsonResponse({"status": "success", "user_id": user_id, "roster": result}, json_dumps_params={'ensure_ascii': False})
            
    except DatabaseError as e:
        print(f"[DB Error]: {e}")
        return JsonResponse({"status": "error", "message": "無法取得玩家小隊資料"}, status=500)
    
# 16.【Create 新增】針對特定攻略發表留言 (對應 POST 請求))
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
                
                return JsonResponse({"status": "success", "message": "該則留言已成功刪除！"})
                
        except DatabaseError as e:
            print(f"[Delete Comment Error]: {e}")
            return JsonResponse({"status": "error", "message": "刪除留言失敗，資料庫操作異常"}, status=500)