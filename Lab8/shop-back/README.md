# shop-back (Lab 8)

Django backend API для Online Shop.

## Быстрый старт (Windows / PowerShell)

Перейдите в папку проекта:

```powershell
cd "C:\Users\admin\Desktop\Web-Dev\Lab8\shop-back"
```

Создайте и активируйте виртуальное окружение:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Установите зависимости:

```powershell
pip install -r requirements.txt
```

Примените миграции:

```powershell
python manage.py makemigrations
python manage.py migrate
```

Запустите сервер:

```powershell
python manage.py runserver
```

## API endpoints (JSON)

- `/api/products/` — список всех товаров
- `/api/products/<id>/` — товар по id
- `/api/categories/` — список всех категорий
- `/api/categories/<id>/` — категория по id
- `/api/categories/<id>/products/` — товары по категории

Дополнительно:
- `/api/` — root со списком эндпоинтов

