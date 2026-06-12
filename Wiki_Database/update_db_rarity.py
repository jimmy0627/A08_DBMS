import os
import django
from django.db import connection, DatabaseError

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arknights_api.settings')
django.setup()

def add_rarity_column():
    try:
        with connection.cursor() as cursor:
            # Check if column exists
            cursor.execute("SHOW COLUMNS FROM material LIKE 'rarity'")
            if cursor.fetchone():
                print("Column 'rarity' already exists in 'material' table.")
                return

            print("Adding 'rarity' column to 'material' table...")
            cursor.execute("ALTER TABLE material ADD COLUMN rarity TINYINT DEFAULT 1 COMMENT '素材稀有度 (1:白, 2:綠, 3:藍, 4:紫, 5:金)';")
            print("Successfully added 'rarity' column.")
            
    except DatabaseError as e:
        print(f"Error updating database: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    add_rarity_column()
