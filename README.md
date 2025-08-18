# SQL Utility Helper (WIP)

Web-based replacement for a legacy Windows .exe utility to run encrypted SQL against Oracle DB and export results. The project is actively in progress and is designed to be consumed both via a browser UI and directly over an HTTP API in a microservice scenario.

- Two distinct pages in the frontend:
  - User page: executes encrypted .US SQL files and exports results to CSV.
  - Admin page: everything the User page does, plus encrypts .sql into .us files for distribution.
- Backend: NestJS + oracledb, exposes a simple REST API.
- Frontend: React (CRA).

> Status: Work in progress. This app is an alternative to a legacy .exe and can also be called via API from other services/microservices.

## Flowchart

```mermaid
flowchart TD
  subgraph Frontend
    A[Login User] --> B[User Page]
    A2[Login Admin] --> C[Admin Page]
    B --> D[Upload .US]
    C --> E[Upload .sql to encrypt]
  end

  D -->|POST /sql/execute (user, password, tnsAlias, usfile)| F[Backend API]
  E -->|POST /sql/encrypt (sqlfile)| F

  F -->|Oracle Client (TNS)| G[(Oracle DB)]
  G --> F --> H[JSON result: columns + rows]
  H --> B
  B --> I[Download CSV]
  E --> J[Download .US]

  subgraph Integrations
    K[External Microservice]
  end
  K -->|Calls /sql/execute with credentials + .US| F
```

## Monorepo Structure

```
backend/   # NestJS API (Oracle access, encryption/decryption, CSV server-side helper)
frontend/  # React app with two routes/pages (User/Admin)
```

## Prerequisites

- Node.js 18+ and npm
- Oracle Database client libraries available for `oracledb` (Instant Client or full client)
- A valid `tnsnames.ora` configured; this repo expects it at `backend/config/oracle/tnsnames.ora` (the backend sets `TNS_ADMIN` to this folder at runtime)

## Quickstart

Run API and UI locally in development mode.

1) Backend (NestJS)

```powershell
cd "backend"
npm install
npm run start:dev
```

The API listens on http://localhost:3000 (CORS enabled).

2) Frontend (React)

```powershell
cd "frontend"
npm install
npm start
```

CRA defaults to port 3000. If the backend is already using 3000, CRA will auto-prompt and run on 3001. Access the app at:

- http://localhost:3001/login-user (User)
- http://localhost:3001/login-admin (Admin)

## Two distinct pages (UX)

- User page
  - Enter DB credentials and a TNS alias.
  - Upload an encrypted `.US` file.
  - Execute against Oracle and view tabular results.
  - Export results as CSV.

- Admin page
  - All User features.
  - Additionally, upload a `.sql` and receive an encrypted `.us` for distribution.

## API Overview (Backend)

Base URL: `http://localhost:3000`

- POST `/sql/execute`
  - multipart/form-data fields: `user`, `password`, `tnsAlias`, file `usfile`
  - Response JSON: `{ columns: string[], data: any[][] }`
  - Executes the decrypted SQL; supports SELECT or PL/SQL blocks.

- POST `/sql/encrypt`
  - multipart/form-data file: `sqlfile` (plain .sql)
  - Response: binary body of the encrypted `.us` file.

- POST `/sql/download-csv`
  - Body JSON: `{ columns: string[], data: any[] }`
  - Returns a CSV; note the UI already generates CSV client-side.

Notes:
- The encryption used mirrors the legacy tool (AES-128-CBC with a shared key). Future work will externalize the key.
- `tnsnames.ora` must define the alias you pass via `tnsAlias`.

## Legacy replacement and Microservice use

This project replaces a manual Windows .exe workflow with a web UI and an HTTP API. Other services can call the API directly to execute pre-encrypted queries without any UI. Example (pseudo-PowerShell):

```powershell
# Example: call /sql/execute with a .US file
Invoke-RestMethod -Uri "http://localhost:3000/sql/execute" -Method Post -Form @{
  user="scott"; password="tiger"; tnsAlias="ORCLPDB1"; usfile=Get-Item ".\query.us"
}
```

## Security

- Do not commit secrets or production connection strings.
- Prefer HTTPS in production.
- Rotate and externalize the encryption key; avoid shipping hard-coded secrets.

## Roadmap

- Proper auth (tokens/SSO), roles for Admin vs User
- Externalize encryption key and secure storage (e.g., KMS)
- Improved error handling and audit logging
- Dockerization and CI
- Packaging a thin microservice client

## License

See package metadata. This repository is currently UNLICENSED for redistribution unless stated otherwise.
