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
            # 透過 JOIN 關聯 Guides (攻略表) 與 Registered_User (玩家表) 來取得作者名稱
            sql = """
                SELECT G.guide_id, U.username, G.title, G.content, G.created_at 
                FROM Guides G
                JOIN Registered_User U ON G.user_id = U.user_id
                WHERE G.stage_id = %s
            """
            cursor.execute(sql, [stage_id])
            rows = cursor.fetchall()
            
            result = [{"id": r[0], "author": r[1], "title": r[2], "content": r[3], "date": r[4]} for r in rows]
            return JsonResponse({"status": "success", "data": result}, json_dumps_params={'ensure_ascii': False})
            
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