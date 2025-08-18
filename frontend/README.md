# Frontend (React)

React app for SQL Utility Helper with two distinct pages and simple login screens:

- `/login-user` → navigates to `/user`
- `/login-admin` → navigates to `/admin`

Two distinct functional pages:

- User Page (`/user`)
	- Fill DB credentials and TNS alias
	- Upload encrypted `.US` file
	- Execute via backend API and view results
	- Export CSV client-side

- Admin Page (`/admin`)
	- All User features
	- Encrypt `.sql` into `.us` via backend API and download

## Development

```powershell
npm install
npm start
```

If the backend (Nest) is already listening on port 3000, CRA will prompt to use the next port (e.g., 3001). Access:

- http://localhost:3001/login-user
- http://localhost:3001/login-admin

## Backend API

Ensure the backend is running on http://localhost:3000.

- POST `/sql/execute` (form-data: `user`, `password`, `tnsAlias`, file `usfile`)
- POST `/sql/encrypt` (form-data: file `sqlfile`)

## Notes

This is a work in progress alternative to a legacy .exe. It can also be used headlessly by calling the backend API from other services.
