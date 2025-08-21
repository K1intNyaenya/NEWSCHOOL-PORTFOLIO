### React Components

ProtectedRoute(props):
- Props: `requiredRole?: string | string[]`
- Behavior: Guards nested routes via `<Outlet />`; redirects to `/` if unauthenticated, `/unauthorized` if role mismatch
- Usage:
```jsx
<Route element={<ProtectedRoute requiredRole="admin" />}>...
```

LoginForm:
- Controlled form for username/password; calls `login()` and routes users based on role to `/admin-dashboard` or `/dashboard`

Dashboard:
- Fetches members for current tenant; displays `PortfolioViewCard` list with search; fetches profile images per member

AdminDashboard:
- Admin portal for listing members, adding members, viewing and approving pending applications, uploading profile images
- Uses `PersonalDetails`, `EmploymentHistory`, `UserCredentials`, `PortfolioCard`, `PendingForm`, `ApplicationForm`

ApplicationForm:
- Public application form; reads `email` and `tenant_id` from URL, posts to `/submit-application-form/`

PortfolioCard(props):
- Props: `{ user, onUpdate(user), uploadProfileImage(memberId, base64), fetchProfileImage?(memberId) }`
- Behavior: View/edit member details; add employment rows; upload and save profile image

PortfolioViewCard(props):
- Props: `{ user }`
- Behavior: Read-only card; loads profile image; shows fields and employment history

EmploymentHistory(props):
- Props: `{ user, setUser }`
- Behavior: Add/remove job rows; edit employer/job_title fields

PersonalDetails(props):
- Props: `{ user, setUser, errors }`
- Behavior: Edit core fields; choose `employment_status` and `member_country` from preset options

UserCredentials(props):
- Props: `{ user, setUser }`
- Behavior: Set `username` and `password` with basic required validation

PendingForm(props):
- Props: `{ applicantData, onClose, onApprove, onReject }`
- Behavior: Presents application details; opens approval form to collect credentials and comments; calls callbacks

Routing:
- `main.jsx` defines routes: `/` login, protected `/dashboard`, `/application-form`, `/admin-dashboard` (admin), `/unauthorized`
