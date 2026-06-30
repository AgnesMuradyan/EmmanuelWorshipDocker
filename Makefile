
.PHONY: help install-backend-dev install-frontend test test-backend test-frontend lint lint-backend lint-frontend service-up service-down

BACKEND_ENV = SECRET_KEY=test DEBUG=True ALLOWED_HOSTS=testserver,localhost,127.0.0.1 DATABASE_URL=sqlite:///test.sqlite3 CORS_ALLOWED_ORIGINS_DEPLOY=http://localhost:3000 CORS_ALLOWED_WHITELIST_DEPLOY=http://localhost:3000 CSRF_TRUSTED_ORIGINS_DEPLOY=http://localhost:3000
PYTHON ?= python3

help:
	@echo "Available commands:"
	@echo "  make install-backend-dev  Install backend runtime and lint dependencies"
	@echo "  make install-frontend     Install frontend dependencies"
	@echo "  make test                 Run backend and frontend tests"
	@echo "  make lint                 Run backend and frontend linters"
	@echo "  make service-up           Start Docker services"
	@echo "  make service-down         Stop Docker services"

install-backend-dev:
	cd backend && $(PYTHON) -m pip install -r requirements-dev.txt

install-frontend:
	cd frontend && npm install

test: test-backend test-frontend

test-backend:
	cd backend && $(BACKEND_ENV) $(PYTHON) manage.py test myapp

test-frontend:
	cd frontend && npm run test:ci

lint: lint-backend lint-frontend

lint-backend:
	ruff check backend

lint-fix:
	ruff check backend --fix

lint-frontend:
	cd frontend && npm run lint

service-up:
	docker compose up --build

service-down:
	docker compose down
