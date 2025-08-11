---
inclusion: always
---

# Technology Stack & Development Guidelines

## Core Stack

- **Backend**: Flask 3.0.2 with application factory pattern
- **Database**: Supabase (PostgreSQL) - use `utils/supabase_client.py` for all DB operations
- **Authentication**: OAuth (Google/GitHub) via Authlib + Flask-Login sessions
- **Frontend**: Jinja2 templates + Tailwind CSS + vanilla JavaScript/Chart.js
- **Testing**: pytest with coverage reporting

## Code Style Requirements

- **Python**: Use black formatting, isort for imports, type hints required
- **Functions**: Snake_case naming, descriptive names indicating purpose
- **Classes**: PascalCase, dataclasses for models
- **Files**: Snake*case with purpose suffix (`*\_routes.py`, `_\_service.py`, `test_\*.py`)
- **Templates**: Match route names (`create_people connection.html`)

## Architecture Patterns

- **Service Layer**: Business logic in `*_service.py` files, not in routes
- **Blueprints**: Separate route files (`auth_routes.py`, `analytics_routes.py`, etc.)
- **Error Handling**: Use structured logging via `utils/logger.py`, graceful degradation
- **Data Models**: Dataclasses in `models.py` with Supabase integration

## Development Commands (Windows)

```bash
# Setup
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Run development
python app.py
flask run --debug

# Testing
pytest
pytest --cov=app tests/

# Code quality (run before commits)
black .
isort .
flake8
mypy app/
```

## Key Libraries & Usage

- **Analytics**: NumPy/Pandas for data processing, scikit-learn for ML
- **HTTP**: Use httpx for async requests, requests for sync
- **Scheduling**: schedule library for task automation
- **Security**: Flask-WTF for CSRF, validate all user inputs

## Common Patterns

- Import Supabase client: `from utils.supabase_client import get_supabase_client`
- Logging: `from utils.logger import get_logger; logger = get_logger(__name__)`
- Route protection: Use `@login_required` decorator from Flask-Login
- Error responses: Return JSON with consistent structure `{"error": "message", "code": 400}`
