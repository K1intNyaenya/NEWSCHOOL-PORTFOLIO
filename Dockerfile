FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY client/app/package*.json ./
RUN npm ci

COPY client/app ./
RUN npm run build


FROM python:3.12-slim AS backend-base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
 && rm -rf /var/lib/apt/lists/*

COPY server/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY server/portfolio_project /app

COPY --from=frontend-build /app/dist /app/staticfiles/frontend

ENV DJANGO_SETTINGS_MODULE=portfolio_project.settings \
    PYTHONPATH=/app \
    PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:${PORT}"]


FROM backend-base AS backend


FROM nginx:alpine AS frontend

COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
