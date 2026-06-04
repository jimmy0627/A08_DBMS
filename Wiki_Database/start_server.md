# 啟動後端伺服器 (Start Backend Server)

如果您已經配置好開發環境（Python 虛擬環境與 MySQL 資料庫），可以使用以下指令快速啟動。

## 使用 PowerShell (推薦)

您可以直接複製並在 VS Code 終端機執行此連結指令：

```powershell
& "d:/VS new clone/A08_DBMS/Wiki_Database/.venv/Scripts/python.exe" manage.py runserver
```

## 常用指令清單

| 功能 | 指令 |
| :--- | :--- |
| **啟動伺服器** | `python manage.py runserver` |
| **同步資料庫 (Migrate)** | `python manage.py migrate` |
| **建立資料庫遷移檔** | `python manage.py makemigrations` |
| **建立超級管理員** | `python manage.py createsuperuser` |

---

## 第一次運行的環境初始化

如果換了環境或是依賴消失，請按順序執行：

1. **建立及進入虛擬環境**:
   ```powershell
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

2. **安裝必要套件**:
   ```powershell
   pip install django mysqlclient
   ```

3. **初始化資料庫**:
   ```powershell
   python manage.py migrate
   ```
