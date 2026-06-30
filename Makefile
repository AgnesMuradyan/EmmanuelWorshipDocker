
.PHONY: help install-backend-dev install-frontend sync-backend test test-backend test-frontend lint lint-backend lint-frontend lint-fix lock-backend service-up service-down

BACKEND_ENV = SECRET_KEY=test DEBUG=True ALLOWED_HOSTS=testserver,localhost,127.0.0.1 DATABASE_URL=sqlite:///test.sqlite3 CORS_ALLOWED_ORIGINS_DEPLOY=http://localhost:3000 CORS_ALLOWED_WHITELIST_DEPLOY=http://localhost:3000 CSRF_TRUSTED_ORIGINS_DEPLOY=http://localhost:3000

help:
	@echo "Available commands:"
	@echo "  make install-backend-dev  Sync backend runtime and dev dependencies with uv"
	@echo "  make install-frontend     Install frontend dependencies"
	@echo "  make test                 Run backend and frontend tests"
	@echo "  make lint                 Run backend and frontend linters"
	@echo "  make lock-backend         Update backend uv.lock"
	@echo "  make service-up           Start Docker services"
	@echo "  make service-down         Stop Docker services"

install-backend-dev: sync-backend

sync-backend:
	cd backend && uv sync

lock-backend:
	cd backend && uv lock

install-frontend:
	cd frontend && npm install

test: test-backend test-frontend

test-backend:
	cd backend && $(BACKEND_ENV) uv run python manage.py test myapp

test-frontend:
	cd frontend && npm run test:ci

lint: lint-backend lint-frontend

lint-backend:
	cd backend && uv run ruff check .

lint-fix:
	cd backend && uv run ruff check . --fix

lint-frontend:
	cd frontend && npm run lint

service-up:
	docker compose up --build

service-down:
	docker compose down
