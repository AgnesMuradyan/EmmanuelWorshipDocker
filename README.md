# Emmanuel Worship

Dockerized worship planning app with a Django REST backend and a React frontend.

## Project Layout

```text
backend/                 Django project and REST API
backend/myapp/           Worship domain models, serializers, views, and tests
frontend/                React app
frontend/src/components/ React screens and UI components
nginx/                   Nginx container configuration
docker-compose.yml       Local multi-service app stack
Makefile                 Common development commands
```

## Local Setup

Create the backend environment and install development dependencies:

```bash
cd backend
uv sync
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Copy the example frontend environment and set the API URL for local development:

```bash
cp frontend/.env.example frontend/.env
```

## Common Commands

Run everything through the Makefile from the repository root:

```bash
make test
make lint
make service-up
make service-down
```

Run backend tests only:

```bash
make test-backend
```

Run frontend tests only:

```bash
make test-frontend
```

## Quality Tools

Backend linting uses Ruff and is configured in `pyproject.toml`.

Frontend linting uses the React Scripts ESLint setup from `frontend/package.json`.

Backend tests use Django's test runner. The Makefile supplies a SQLite `DATABASE_URL` and safe local environment values so the tests do not require Postgres.

Frontend tests use Jest and React Testing Library.
