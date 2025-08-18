# Backend (NestJS API)

This is the NestJS API for SQL Utility Helper. It exposes endpoints to execute encrypted SQL files against Oracle and to encrypt plain `.sql` into `.us` for distribution. It is part of a monorepo; see the root `README.md` for an overview and a Mermaid flow.

## Endpoints

Base URL: `http://localhost:3000`

- POST `/sql/execute`
  - multipart/form-data: `user`, `password`, `tnsAlias`, file `usfile`
  - Returns: JSON `{ columns: string[], data: any[][] }`
  - Behavior: decrypts `.us`, executes against Oracle (SELECT or PL/SQL blocks). CORS is enabled.

- POST `/sql/encrypt`
  - multipart/form-data: file `sqlfile` (plain .sql)
  - Returns: encrypted `.us` as binary download

- POST `/sql/download-csv`
  - body: `{ columns: string[], data: any[] }`
  - Returns: CSV file

## Oracle Client and TNS

At startup we set `TNS_ADMIN` to `backend/config/oracle`, so place your `tnsnames.ora` there. Ensure the alias you pass in `tnsAlias` exists in that file and that the Oracle client libraries are available for the `oracledb` Node module.

## Development

```powershell
npm install
npm run start:dev
```

The API listens on port 3000 by default.

## Security Notes

- Replace the hard-coded encryption key with a secure secret provider for production.
- Never commit credentials or production TNS entries with secrets.
- Prefer HTTPS and proper authentication/authorization when exposing this service.

## Roadmap

- Externalize encryption key (KMS/KeyVault)
- AuthN/AuthZ and roles
- Improved errors and audit logs
- Docker/CI
