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
    # 網址範例： /api/operators/銀灰/materials/2/
    path('operators/<str:op_name>/materials/<int:elite_stage>/', views.get_operator_materials, name='operator_materials'),
]