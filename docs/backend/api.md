### Backend API

Base URL: `/portfolio/`

Endpoints:
- `POST /token/` — Obtain JWT access and refresh tokens
- `POST /token/refresh/` — Refresh access token
- `GET /<tenant_id>/NewSchoolMember/` — List members (paginated)
- `POST /<tenant_id>/NewSchoolMember/add/` — Create member (admin)
- `GET /<tenant_id>/NewSchoolMember/<member_id>/` — Retrieve member
- `PUT /<tenant_id>/NewSchoolMember/<member_id>/` — Update member
- `DELETE /<tenant_id>/NewSchoolMember/<member_id>/` — Delete member
- `POST /<tenant_id>/api/login/` — Login; returns tokens and user info
- `POST /<tenant_id>/submit-application-form/` — Submit application
- `POST /<tenant_id>/review-application/<application_id>/` — Approve/reject (admin)
- `GET /<tenant_id>/pending-applications/` — List pending applications
- `POST /<tenant_id>/send-application/<applicant_email>/` — Email application link (admin)
- `POST /<tenant_id>/send-reset-password-link/<email>/` — Email reset link
- `POST /<tenant_id>/upload-profile-image/` — Upload base64 image
- `GET /<tenant_id>/get-profile-image/<member_id>/` — Get image URL
- `GET /health-check/` — Server status
- `GET /<tenant_id>/choices/` — Enum choices

Auth and Tenancy:
- Header: `authorization: Bearer <ACCESS_TOKEN>` on protected routes
- Header: `x-tenant-id: <TENANT_ID>` is required by frontend and read server-side
- Tenant is inferred from the URL `<tenant_id>` segment by middleware

Pagination:
- Query params: `page`, `page_size` (max 100)
- Response: `{ success, message, data, count, next, previous }`

Examples:
```bash
# Obtain tokens
curl -X POST http://127.0.0.1:8080/portfolio/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"pass"}'

# List members
curl -H 'authorization: Bearer <ACCESS>' \
  -H 'x-tenant-id: <TENANT>' \
  http://127.0.0.1:8080/portfolio/<TENANT>/NewSchoolMember/

# Create member (admin)
curl -X POST -H 'Content-Type: application/json' \
  -H 'authorization: Bearer <ACCESS>' -H 'x-tenant-id: <TENANT>' \
  -d '{
    "first_name":"A",
    "second_name":"B",
    "family_name":"C",
    "member_title":"Engineer",
    "member_email":"a@b.com",
    "employment_status":"FT",
    "member_country":"KE"
  }' \
  http://127.0.0.1:8080/portfolio/<TENANT>/NewSchoolMember/add/
```
