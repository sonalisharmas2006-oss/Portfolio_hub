Alembic migration directory. Initialize the first revision after installing dependencies:
`alembic revision --autogenerate -m "initial schema"` then `alembic upgrade head`.
The development startup also calls SQLAlchemy create_all for a convenient first run. Use migrations for deployed environments.
