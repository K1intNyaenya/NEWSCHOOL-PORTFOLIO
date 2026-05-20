# New School Portfolio

Multi-tenant HR portfolio application for managing members, applications, and employment history. The stack is a **React (Vite)** frontend and a **Django REST Framework** backend with **MySQL**, packaged for deployment with **Docker**.

## Features

- JWT-based authentication (admin and member roles)
- Multi-tenant data isolation via tenant ID in API paths
- Member directory and portfolio cards with profile images
- Admin dashboard: add members, review pending applications, send application forms
- Public application form submission per tenant

## Tech stack

| Layer      | Technology                                      |
|-----------|--------------------------------------------------|
| Frontend  | React 18, Vite, React Router, Axios              |
| Backend   | Django 5, Django REST Framework, Simple JWT      |
| Database  | MySQL 8                                          |
| Deploy    | Docker (multi-stage Dockerfile), docker-compose  |

## Project structure

```
NEWSCHOOL-PORTFOLIO/
├── client/app/              # React frontend (Vite)
│   └── src/
├── server/
│   ├── requirements.txt
│   └── portfolio_project/   # Django project
│       ├── manage.py
│       └── portfolio/       # App (models, views, management commands)
├── Dockerfile               # Builds backend + frontend images
├── docker-compose.yml       # Production-style compose (backend + frontend)
└── docker-compose.dev.yml   # Dev overrides (host MySQL)
```

## Prerequisites

- **Node.js** 20+ (for local frontend dev)
- **Python** 3.12+ (for local backend dev)
- **MySQL** 8 (installed locally or via Docker)
- **Docker** and **docker-compose** (for containerized runs)

## Environment variables

The backend reads configuration via `python-decouple` from the environment (or a `.env` file in `server/portfolio_project/`).

| Variable              | Description                    | Example              |
|-----------------------|--------------------------------|----------------------|
| `SECRET_KEY`          | Django secret key              | (long random string) |
| `DB_NAME`             | MySQL database name            | `newschool`          |
| `DB_USER`             | MySQL user                     | `klint`              |
| `DB_PASSWORD`         | MySQL password                 | —                    |
| `DB_HOST`             | MySQL host                     | `localhost` or `db` |
| `DB_PORT`             | MySQL port                     | `3306`               |
| `EMAIL_HOST_USER`     | SMTP user (Gmail, etc.)          | —                    |
| `EMAIL_HOST_PASSWORD` | SMTP app password              | —                    |

Do not commit real secrets. Use `.env` locally and inject variables in production.

## Local development (without Docker)

### 1. Database

Create a MySQL database and user matching your env vars (defaults in settings use `newschool` / `klint`).

### 2. Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cd portfolio_project
python manage.py migrate
python manage.py runserver
```

API base: `http://127.0.0.1:8000/portfolio/`

### 3. Frontend

```bash
cd client/app
npm install
npm run dev
```

Dev server: `http://localhost:5173`

Ensure API calls in the frontend target the backend (port **8000**), not the static dev server port.

### 4. Create a tenant and admin

From `server/portfolio_project` with the venv active:

```bash
# Create tenant (tenant_id defaults to a new UUID)
python manage.py create_tenant "My Organization" --tenant_domain example.com

# Create admin for that tenant (use the tenant_id from the command output)
python manage.py create_admin <username> <email> <password> <tenant_id>
```

## Docker

### Build images

From the repository root:

```bash
docker build -t newschool-backend --target backend .
docker build -t newschool-frontend --target frontend .
```

### Run with host MySQL (development)

Use this when MySQL is already running on the machine (port 3306):

```bash
docker run --rm -p 8000:8000 \
  --add-host host.docker.internal:host-gateway \
  -e SECRET_KEY="dev-secret-key" \
  -e DB_NAME="newschool" \
  -e DB_USER="klint" \
  -e DB_PASSWORD="your-password" \
  -e DB_HOST="host.docker.internal" \
  -e DB_PORT="3306" \
  newschool-backend

# Separate terminal — frontend
docker run --rm -p 8080:80 newschool-frontend
```

- Frontend UI: `http://localhost:8080`
- Backend API: `http://localhost:8000/portfolio/`

Login and authenticated API requests must go to the **backend** (`8000`), not the Nginx frontend (`8080`).

### Run with docker-compose (dev)

Uses `docker-compose.dev.yml` to point the backend at host MySQL:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d backend frontend
```

### Production on a VM

1. Use a managed MySQL service or a dedicated MySQL container.
2. Set strong values for `SECRET_KEY` and database credentials in `docker-compose.yml` or via env files.
3. Consider **Azure Database for MySQL** instead of MySQL inside the app VM for backups and HA.
4. Put a reverse proxy (Nginx/Caddy) in front with TLS; use **gunicorn** instead of `runserver` for Django in production.

## API overview

Base path: `/portfolio/`

| Endpoint (examples)                         | Purpose              |
|--------------------------------------------|----------------------|
| `POST /portfolio/token/`                   | Login (JWT)          |
| `POST /portfolio/token/refresh/`           | Refresh token        |
| `GET /portfolio/<tenant_id>/NewSchoolMember/` | List members      |
| `POST /portfolio/<tenant_id>/submit-application-form/` | Application |
| `GET /portfolio/<tenant_id>/pending-applications/` | Admin pending list |

Tenant context is taken from the URL path (`<tenant_id>`). Some paths (e.g. `token/`, `health-check`) skip tenant middleware.

## Management commands

| Command          | Purpose                                      |
|------------------|----------------------------------------------|
| `create_tenant`  | Create tenant with name, domain, optional ID |
| `create_admin`   | Create staff/superuser bound to a tenant     |

Examples:

```bash
python manage.py create_tenant "Acme Corp" --tenant_domain acme.example.com
python manage.py create_admin admin admin@acme.com SecurePass123 <tenant_id>
```

No Docker rebuild is required after adding tenants or users—only the database changes.

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|----------------|-----|
| `404` on `POST /portfolio/token/` from port 8080 | Request hits frontend Nginx, not Django | Call API on port **8000** or add a reverse proxy |
| `ModuleNotFoundError: decouple` | Missing dependency in image | Rebuild backend after updating `requirements.txt` |
| `mysqlclient` / MySQLdb error | Driver not installed in container | Ensure `mysqlclient` is in `requirements.txt` and rebuild |
| Logging `FileNotFoundError` for serverlog | Old absolute log path | Settings use `BASE_DIR/serverlog.log` inside the project |
| Port 8000 / 80 / 3306 already in use | Host service conflict | Stop conflicting service or change compose port mappings |
| `ContainerConfig` with old docker-compose | Stale containers / compose v1 bug | Remove old containers; prefer `docker compose` (v2) |

## License

Private / internal use unless otherwise specified by the repository owner.
