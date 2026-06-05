from django.urls import path
from . import views

urlpatterns = [
    # 幹員養成與技能
    path('operators/<str:op_name>/materials/<int:elite_stage>/', views.get_operator_materials),
    
    # 關卡與掉落
    path('stages/', views.get_stages),
    path('stages/<str:stage_id>/drops/', views.get_stage_drops),
    
    # 攻略系統
    path('stages/<str:stage_id>/guides/', views.get_guides_by_stage),
    path('guides/create/', views.create_guide),
    path('guides/<int:guide_id>/delete/', views.delete_guide),
    
    # 個人庫更新
    path('users/<int:user_id>/operators/<int:op_id>/update/', views.update_own_operator),
    # 測試用 API：查詢特定幹員所需的升級素材
    path('operator/<str:op_name>/materials/<int:elite_stage>/', views.get_operator_materials, name='operator_materials'),
    #查詢特定幹員技能專精素材
    path('operator/<int:op_id>/skills/', views.get_skill_materials),
    #查詢特定幹員模組升級素材
    path('operator/<int:op_id>/modules/', views.get_module_materials),
    # 核心養成計算機：一鍵計算總消耗
    path('operator/<int:op_id>/calculate-total/', views.calculate_operator_total_costs),
    #使用者註冊
    path('auth/register/', views.register_user),
    # 使用者登入
    path('auth/login/', views.login_user),
    # 新增關卡
    path('stages/create/', views.create_stage),
    # 獲取全幹員圖鑑清單
    path('operators/list/', views.get_operator_list),
    # 獲取素材圖鑑清單
    path('materials/list/', views.get_materials_list),
    # 獲取素材消耗詳情
    path('materials/<int:material_id>/usage/', views.get_material_usage_detail),
    
    # 獲取特定玩家的持有小隊練度
    path('users/<int:user_id>/roster/', views.get_user_roster),
    # 將幹員加入持有名單
    path('operators/roster/add/', views.add_to_roster),
    # 從持有名單移除幹員
    path('users/<int:user_id>/operators/<int:op_id>/delete/', views.delete_from_roster),
    # 獲取玩家發布的攻略
    path('users/<int:user_id>/guides/', views.get_user_guides),
    
    # 新增攻略留言
    path('guides/comments/create/', views.create_guide_comment),
    # 刪除攻略留言
    path('guides/<int:guide_id>/comments/delete/', views.delete_guide_comment),
    
    # 載入幹員詳細資料
    path('operator/<str:op_id>/detail/', views.get_operator_detail),
]
