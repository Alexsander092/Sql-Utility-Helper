# SQL Utility Helper

A modern web application with a responsive dashboard UI that replaces a legacy Windows executable utility for running encrypted SQL against Oracle databases and exporting results. This project provides both a user-friendly browser interface and a robust HTTP API for integration with other services.

## Features

### User Interface:
- **Modern dashboard** with responsive design and styled components
- **Landing page** with selection between User or Admin access
- **User Mode**: 
  - Execute encrypted SQL files (.US)
  - Export results to CSV
  - View results in popup with pagination and sorting
- **Admin Mode**: 
  - All user functionalities
  - Encrypt .SQL files to .US format
  - Decrypt .US files for viewing
  - **✨ Direct SQL execution** without file requirement
- **Real-time connection testing** with visual status indicators
- **TNS aliases dropdown** automatically populated from server
- **Loading states** and improved error handling
- **Advanced results popup** with features:
  - Customizable pagination (25, 50, 100 rows)
  - Column sorting
  - CSV export
  - Print results
  - Copy to clipboard

### Backend:
- **Built with NestJS** and oracledb driver
- **RESTful API** for SQL execution and file management
- **Secure encryption/decryption** of SQL files
- **Optimized Oracle connection** management
- **CSV generation** for data export
- **✨ Direct execution endpoint** for SQL without files

### Technical Highlights:
- Modern React frontend with responsive design and dashboard UI
- Consistent styling with reusable component system
- Enhanced user experience with loading states
- Secure handling of database credentials
- Support for both query results and PL/SQL block execution
- API-first design for easy integration
- Internationalized UI elements for better accessibility

## Application Flow

```mermaid
flowchart TD
    Start([User accesses application]) --> Landing[Landing Page]
    
    Landing --> UserLogin[User Login]
    Landing --> AdminLogin[Admin Login]
    
    UserLogin --> UserDash[User Dashboard]
    AdminLogin --> AdminDash[Admin Dashboard]
    
    subgraph UserDash [User Dashboard]
        UC1[Configure DB Connection] --> UC2[Test Connection]
        UC2 --> UC3[Select .US file]
        UC3 --> UC4[Execute SQL]
        UC4 --> UC5[View Results]
        UC5 --> UC6[Export CSV]
    end
    
    subgraph AdminDash [Admin Dashboard]
        AC1[Configure DB Connection] --> AC2[Test Connection]
        
        AC2 --> AC3A[Encrypt File]
        AC2 --> AC3B[Decrypt File]
        AC2 --> AC3C[Direct SQL Execution]
        AC2 --> AC3D[Execute .US file]
        
        AC3A --> AC4A[Select .SQL] --> AC5A[Download .US]
        AC3B --> AC4B[Select .US] --> AC5B[View content]
        AC3C --> AC4C[Write SQL] --> AC5C[Execute directly]
        AC3D --> AC4D[Select .US] --> AC5D[Execute file]
        
        AC5C --> Results[Results Popup]
        AC5D --> Results
    end
    
    subgraph Results [Results Popup]
        R1[Tabular view] --> R2[Pagination]
        R2 --> R3[Column sorting]
        R3 --> R4[Export CSV]
        R4 --> R5[Print]
        R5 --> R6[Copy data]
    end
    
    subgraph Backend [API Backend]
        API1[/sql/execute - Execute .US]
        API2[/sql/encrypt - Encrypt]
        API3[/sql/decrypt - Decrypt]
        API4[/sql/execute-direct - Direct SQL]
        API5[/sql/test-connection - Test DB]
        API6[/sql/tns-aliases - List TNS]
    end
    
    UserDash -.->|HTTP POST| API1
    AdminDash -.->|HTTP POST| API1
    AdminDash -.->|HTTP POST| API2
    AdminDash -.->|HTTP POST| API3
    AdminDash -.->|HTTP POST| API4
    UserDash -.->|HTTP POST| API5
    AdminDash -.->|HTTP POST| API5
    UserDash -.->|HTTP GET| API6
    AdminDash -.->|HTTP GET| API6
    
    Backend -.->|Oracle Client| DB[(Oracle Database)]
    
    subgraph Integrations [External Integrations]
        K[External Microservice]
    end
    K -.->|Call /sql/execute with .US| Backend
    
    style UserDash fill:#e1f5fe
    style AdminDash fill:#fff3e0
    style Results fill:#f3e5f5
    style Backend fill:#e8f5e8
    style DB fill:#ffebee
    style Integrations fill:#f1f8e9
```
    AdminDash -.->|HTTP POST| API1
    AdminDash -.->|HTTP POST| API2
    AdminDash -.->|HTTP POST| API3
    AdminDash -.->|HTTP POST| API4
    UserDash -.->|HTTP POST| API5
    AdminDash -.->|HTTP POST| API5
    UserDash -.->|HTTP GET| API6
    AdminDash -.->|HTTP GET| API6
    
    Backend -.->|Oracle Client| DB[(Oracle Database)]
    
    subgraph Integrations [Integrações Externas]
        K[Microserviço Externo]
    end
    K -.->|Chamar /sql/execute com .US| Backend
    
    style UserDash fill:#e1f5fe
    style AdminDash fill:#fff3e0
    style Results fill:#f3e5f5
    style Backend fill:#e8f5e8
    style DB fill:#ffebee
    style Integrations fill:#f1f8e9
```

## Project Structure

```
sql-utility-helper/
├── backend/               # NestJS API server
│   ├── config/
│   │   └── oracle/        # Oracle configuration (tnsnames.ora)
│   └── src/
│       ├── modules/
│       │   └── sql/       # SQL-related controllers and services
│       └── main.ts        # Application entry point
│
├── frontend/              # React frontend application
│   └── src/
│       ├── pages/         # Application pages (User, Admin, Login, Landing)
│       └── AppRoutes.jsx  # Application routing configuration
```

## Prerequisites

- Node.js 18+ and npm
- Oracle Database client libraries for `oracledb` (Instant Client or full client)
- Valid `tnsnames.ora` file (configured at `backend/config/oracle/tnsnames.ora`)

## Installation & Setup

### Backend Setup

1. Install dependencies:
   ```powershell
   cd backend
   npm install
   ```

2. Configure Oracle client:
   - Ensure Oracle client libraries are installed and in your PATH
   - Place your `tnsnames.ora` in the `backend/config/oracle/` directory

3. Start the NestJS server:
   ```powershell
   npm run start:dev
   ```
   
   The API will run on http://localhost:3002 with CORS enabled.

### Frontend Setup

1. Install dependencies:
   ```powershell
   cd frontend
   npm install
   ```

2. Start the React application:
   ```powershell
   npm start
   ```

   The frontend will run on http://localhost:3001

3. Access the application:
   - Home page: http://localhost:3001/
   - User login: http://localhost:3001/login-user
   - Admin login: http://localhost:3001/login-admin

## API Endpoints

### SQL Execution
- **POST** `/sql/execute` - Execute encrypted .US file
  ```json
  // FormData with:
  // - usfile: .US file
  // - user: string
  // - password: string  
  // - tnsAlias: string
  ```

- **POST** `/sql/execute-direct` - ✨ **New feature** - Execute SQL directly
  ```json
  {
    "user": "username",
    "password": "password", 
    "tnsAlias": "TNS_ALIAS",
    "sqlText": "SELECT * FROM dual"
  }
  ```

### File Management
- **POST** `/sql/encrypt` - Encrypt .SQL file to .US format
  ```json
  // FormData with:
  // - sqlfile: .SQL file
  ```

- **POST** `/sql/decrypt` - Decrypt .US file
  ```json
  // FormData with:
  // - usfile: .US file
  ```

### Utilities
- **GET** `/sql/tns-aliases` - List available TNS aliases
- **POST** `/sql/test-connection` - Test database connection
  ```json
  {
    "user": "username",
    "password": "password",
    "tnsAlias": "TNS_ALIAS"
  }
  ```

## User Guide

### Landing Page
- Choose between User or Admin access mode
- Professional interface with clear navigation options

### User Mode
1. **Connection Setup:**
   - Enter your Oracle database credentials (username and password)
   - Select a TNS alias from the dropdown
   - Test your connection using the "Test Connection" button

2. **SQL File Execution:**
   - Upload an encrypted SQL file (.US)
   - Click "Execute File" to run the SQL
   - View results in the output area
   - Use "View Details" to see results in detailed popup

3. **Data Export:**
   - Use "Save CSV" to export results
   - In the results popup, access advanced features:
     - Customizable pagination
     - Column sorting
     - CSV export
     - Print functionality
     - Copy to clipboard

### Admin Mode
Includes all user functionalities, plus:

1. **File Encryption:**
   - Select a .SQL file using "Choose SQL File"
   - Click "Encrypt File" to generate .US file
   - The encrypted file will be downloaded automatically

2. **File Decryption:**
   - Select an already loaded .US file
   - Click "Decrypt File" to view content
   - Content will appear in the SQL editor

3. **✨ Direct SQL Execution:**
   - Type or paste SQL directly in the "SQL Query Editor"
   - Click "Run SQL" to execute without file requirement
   - View results in the same advanced popup
   - Use "Clear" to clean the editor

## API Reference

Base URL: `http://localhost:3002`

### SQL Execution Endpoints

- **POST** `/sql/execute`
  - **Description**: Executes an encrypted SQL file against Oracle database
  - **Format**: `multipart/form-data`
  - **Parameters**:
    - `user`: Oracle database username
    - `password`: Oracle database password  
    - `tnsAlias`: Oracle TNS connection alias
    - `usfile`: Encrypted SQL file (.US format)
  - **Response**: `{ columns: string[], data: any[][] }`

- **POST** `/sql/execute-direct` ✨ **New**
  - **Description**: Execute SQL directly without file
  - **Format**: `application/json`
  - **Parameters**:
    - `user`: Oracle database username
    - `password`: Oracle database password
    - `tnsAlias`: Oracle TNS connection alias
    - `sqlText`: SQL text to execute
  - **Response**: `{ success: boolean, columns: string[], data: any[][] }`

- **POST** `/sql/encrypt`
  - **Description**: Encrypts plain SQL file to .US format
  - **Format**: `multipart/form-data`
  - **Parameters**:
    - `sqlfile`: Plain SQL file to encrypt
  - **Response**: Encrypted file download

- **GET** `/sql/tns-aliases`
  - **Description**: Retrieves available TNS aliases from tnsnames.ora
  - **Response**: `{ tnsAliases: string[] }`

- **POST** `/sql/test-connection`
  - **Description**: Tests Oracle database connection
  - **Request Format**: `application/json`
  - **Parameters**:
    - `user`: Oracle database username
    - `password`: Oracle database password
    - `tnsAlias`: Oracle TNS connection alias
  - **Response**: `{ success: boolean, message: string }`

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
## Technical Architecture

### Frontend (React)
- **Main Components**:
  - `LandingPage.jsx`: Entry point with mode selection
  - `UserPage.jsx`: Interface for SQL execution
  - `AdminPage.jsx`: Interface for SQL execution and encryption
  - `LoginUser.jsx` & `LoginAdmin.jsx`: Authentication screens
- **Routing**: React Router for navigation
- **State Management**: React Hooks for local state

### Backend (NestJS)
- **Controllers**:
  - `SqlController`: Handles HTTP requests for SQL operations
- **Services**:
  - `SqlService`: Business logic for SQL execution, encryption, and Oracle connectivity
- **Database**: Oracle connection via oracledb npm package
- **File Processing**: Encryption/decryption using crypto module

### Security
- Credentials are not stored, only used for the current session
- SQL files are encrypted using AES-128-CBC algorithm
- Proper error handling prevents information leakage

## Development Guide

### Environment Variables

Backend:
- `PORT`: Server port (default: 3002)
- `TNS_ADMIN`: Path to tnsnames.ora directory (set automatically)

Frontend:
- `REACT_APP_API_BASE`: Backend API URL (default: http://localhost:3002)

### Adding New Features

1. **Adding new SQL operations**:
   - Extend the `SqlService` with new methods
   - Add corresponding endpoints in `SqlController`
   - Update frontend to utilize new endpoints

2. **Extending the UI**:
   - Add new components in the `frontend/src/pages` directory
   - Update `AppRoutes.jsx` to include new routes

3. **Customizing the encryption**:
   - Modify the encryption methods in `SqlService` if needed

## Deployment

### Docker Deployment
```bash
# Build backend
cd backend
docker build -t sql-utility-backend .

# Build frontend
cd frontend
docker build -t sql-utility-frontend .

# Run containers
docker run -d -p 3002:3002 --name backend sql-utility-backend
docker run -d -p 3001:80 --name frontend sql-utility-frontend
```

## Changelog

### ✨ v2.0.0 - Direct SQL Execution (August 2025)

#### New Features
- **Direct SQL Execution**: Administrators can now execute SQL directly without file requirement
  - Integrated SQL editor in admin dashboard
  - Credential validation before execution
  - Results displayed in the same advanced popup
- **Enhanced Results Popup**: 
  - Customizable pagination (25, 50, 100 rows)
  - Column sorting with visual indicators
  - CSV export with custom naming
  - Print functionality
  - Copy to clipboard feature
- **New API Endpoint**: `/sql/execute-direct` for direct execution

#### Improvements
- Admin interface reorganized in 3-column layout
- Independent loading states for each functionality
- Better error handling with specific messages
- More robust connection parameter validation
- Enhanced responsive design

#### Bug Fixes
- Fixed popup blocking issues in some browsers
- Improved Oracle connection stability
- Fixed frontend syntax issues

### v1.0.0 - Initial Release
- Responsive dashboard for users and administrators
- Execution of encrypted .US files
- SQL file encryption/decryption
- CSV export functionality
- Oracle connection testing
- Complete RESTful API

### Production Considerations
- Set up proper SSL/TLS for secure communication
- Implement authentication for production use
- Consider using environment variables for sensitive configuration

## Troubleshooting

### Common Issues

1. **Oracle Client Connection Problems**
   - Ensure Oracle client libraries are correctly installed
   - Verify tnsnames.ora has the correct TNS aliases
   - Check network connectivity to the Oracle server

2. **Frontend-Backend Communication Issues**
   - Verify CORS settings in the backend
   - Ensure API_BASE is correctly set in the frontend

3. **File Upload Issues**
   - Check file size limits in the NestJS configuration
   - Verify file extension and content type handling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Oracle Database team for the oracledb driver
- NestJS team for the backend framework
- React team for the frontend framework
