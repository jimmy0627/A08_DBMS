import os
import django
from django.db import connection, DatabaseError

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arknights_api.settings')
django.setup()

def tune_rarity():
    try:
        with connection.cursor() as cursor:
            # 修改為 T3: 輕錳礦, 研磨石
            print("Updating Rarity to 3 (輕錳礦, 研磨石)...")
            cursor.execute("UPDATE material SET rarity = 3 WHERE name IN ('輕錳礦', '研磨石')")

            # 修改為 T2: 裝置, 酮凝集
            print("Updating Rarity to 2 (裝置, 酮凝集)...")
            cursor.execute("UPDATE material SET rarity = 2 WHERE name IN ('裝置', '酮凝集')")

            print("Database tuning complete.")
            
    except DatabaseError as e:
        print(f"Error updating database: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    tune_rarity()
