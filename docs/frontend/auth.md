### Auth Utilities (`authService.jsx`)

Constants:
- `API_URL`: `http://localhost:8080/portfolio/token/`

Functions:
- `getTenantId(): string | null` — reads `tenant_id` from localStorage
- `getAccessToken(): string | null` — reads `access_token` from localStorage
- `refreshAccessToken(): Promise<boolean>` — POST `/token/refresh/`; updates `access_token` and `user_role` from JWT payload
- `fetchWithAuth(url, options?): Promise<any>` — Attaches `authorization` and `x-tenant-id` headers; auto-refreshes token if expired; throws on non-2xx
- `login(username, password): Promise<'admin'|'member'|'guest'>` — POST to `API_URL`; stores `access_token`, `refresh_token`, `tenant_id`, `user_role`
- `logout(): void` — clears tokens and role from localStorage
- `isAuthenticated(): boolean` — checks access token existence and expiry
- `getUserRole(): 'admin'|'member'|'guest'|null` — reads role from localStorage

Examples:
```js
import { fetchWithAuth, login, logout, getTenantId } from './authService';

await login('alice', 'secret');
const tenantId = getTenantId();
const data = await fetchWithAuth(`http://127.0.0.1:8080/portfolio/${tenantId}/NewSchoolMember/`);
```

Notes:
- Token expiry is checked by decoding JWT `exp`
- Include `Content-Type: application/json` when sending JSON bodies
