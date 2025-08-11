# Project Structure

## Architecture Patterns

### Flask Application Factory Pattern

- Main app creation in `app.py` using `create_app()` function
- Blueprints for route organization (`app_routes.py`, `auth_routes.py`, `profile_routes.py`, `analytics_routes.py`)
- Configuration management via `app/config.py` with environment-based settings

### Service Layer Architecture

- Business logic separated into service classes (`analytics_service.py`, `recommendation_engine.py`)
- Core people connection-making components as standalone modules (`people connection_kernel.py`, `cognitive_currency.py`)
- Data models using dataclasses with Supabase integration (`models.py`)

### Component-Based Frontend

- Reusable template components in `templates/components/`
- Base template inheritance pattern with `base.html`
- Responsive design with Tailwind CSS utilities

## Directory Organization

```
people connection-os/
├── app/                    # Main application package
│   ├── __init__.py        # App factory and initialization
│   ├── config.py          # Configuration settings
│   ├── models.py          # Data models and database schemas
│   ├── *_routes.py        # Route blueprints (auth, app, profile, analytics)
│   ├── *_service.py       # Business logic services
│   ├── people connection_kernel.py # Core people connection engine
│   ├── cognitive_*.py     # Cognitive processing modules
│   └── uploads/           # User file uploads
├── templates/             # Jinja2 HTML templates
│   ├── base.html         # Base template
│   ├── components/       # Reusable template components
│   └── *.html           # Page-specific templates
├── static/               # Static assets
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── images/          # Image assets
├── tests/               # Test suite
│   ├── test_*.py       # Unit and integration tests
│   └── __init__.py     # Test package initialization
├── utils/               # Utility modules
│   ├── logger.py       # Custom logging implementation
│   ├── supabase_client.py # Database client wrapper
│   └── *.py           # Other utilities
├── data/               # Static data files (JSON configs)
├── config/             # Configuration files
├── logs/               # Application log files
└── flask_session/      # Session storage directory
```

## Naming Conventions

### Files and Modules

- Snake_case for Python files: `analytics_service.py`, `people connection_kernel.py`
- Descriptive names indicating purpose: `*_routes.py`, `*_service.py`, `test_*.py`
- Template files match their route/function: `create_people connection.html`, `analytics_dashboard.html`

### Classes and Functions

- PascalCase for classes: `people connectionKernel`, `AnalyticsService`, `User`
- Snake_case for functions and methods: `get_next_task()`, `calculate_quality_score()`
- Dataclasses for data models: `people connection`, `people connectionOption`, `QualityMetric`

### Database and API

- Snake_case for database tables and columns
- RESTful API endpoints: `/api/people connections`, `/analytics/dashboard`
- Consistent error handling and response formats

## Code Organization Principles

### Separation of Concerns

- Routes handle HTTP requests/responses only
- Services contain business logic
- Models define data structures and database interactions
- Utilities provide cross-cutting functionality

### Dependency Injection

- Services injected into routes via blueprints
- Database client as singleton pattern
- Configuration passed through app factory

### Error Handling

- Centralized error handlers in main app
- Structured logging with categories and levels
- Graceful degradation for external service failures
