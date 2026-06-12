import os
import django
from django.db import connection, DatabaseError

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arknights_api.settings')
django.setup()

def update_existing_rarity():
    rarity_logic = [
        # Rarity 5
        (5, ["D32鋼", "聚合劑", "雙極納米片", "燒結核凝晶", "晶體電子單元"]),
        # Rarity 4 (Specific names)
        (4, ["三水錳礦", "五水研磨石", "RMA70-24", "白馬醇", "改良裝置"]),
        # Rarity 4 (Keywords) - Handled separately via LIKE
    ]
    
    try:
        with connection.cursor() as cursor:
            # Set default rarity to 1 for everyone first
            print("Resetting all rarities to 1...")
            cursor.execute("UPDATE material SET rarity = 1")

            # Update Rarity 5
            print("Updating Rarity 5...")
            cursor.execute("UPDATE material SET rarity = 5 WHERE name IN %s", [tuple(rarity_logic[0][1])])

            # Update Rarity 4 (Specific)
            print("Updating Rarity 4 (Specific names)...")
            cursor.execute("UPDATE material SET rarity = 4 WHERE name IN %s", [tuple(rarity_logic[1][1])])

            # Update Rarity 4 (Keywords: 塊, 陣列)
            print("Updating Rarity 4 (Keywords: 塊, 陣列)...")
            cursor.execute("UPDATE material SET rarity = 4 WHERE name LIKE '%%塊%%' OR name LIKE '%%陣列%%'")

            # Update Rarity 3 (Keywords: 組, 酮凝集, 扭轉醇, 裝置)
            print("Updating Rarity 3...")
            cursor.execute("UPDATE material SET rarity = 3 WHERE (name LIKE '%%組%%' OR name LIKE '%%酮凝集%%' OR name LIKE '%%扭轉醇%%' OR name LIKE '%%裝置%%') AND rarity = 1")

            # Update Rarity 2 (Keywords: 固源岩, 異鐵, 聚酸酯, 糖)
            print("Updating Rarity 2...")
            cursor.execute("UPDATE material SET rarity = 2 WHERE (name LIKE '%%固源岩%%' OR name LIKE '%%異鐵%%' OR name LIKE '%%聚酸酯%%' OR name LIKE '%%糖%%') AND rarity = 1")

            print("Database update complete.")
            
    except DatabaseError as e:
        print(f"Error updating database: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    update_existing_rarity()
