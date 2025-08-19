# SQL Utility Helper

A modern web application with a responsive dashboard UI that replaces a legacy Windows executable utility for running encrypted SQL against Oracle databases and exporting results. This project provides both a user-friendly browser interface and a robust HTTP API for integration with other services.

## Funcionalidades

### Interface do Usuário:
- **Dashboard moderno** com design responsivo e componentes estilizados
- **Página inicial** com seleção entre acesso de Usuário ou Administrador
- **Modo Usuário**: 
  - Execução de arquivos SQL criptografados (.US)
  - Exportação de resultados para CSV
  - Visualização de resultados em popup com paginação e ordenação
- **Modo Administrador**: 
  - Todas as funcionalidades do usuário
  - Criptografia de arquivos .SQL em formato .US
  - Descriptografia de arquivos .US para visualização
  - **✨ Execução direta de SQL** sem necessidade de arquivo
- **Teste de conexão** em tempo real com indicadores visuais de status
- **Dropdown de TNS aliases** populado automaticamente do servidor
- **Estados de carregamento** e tratamento de erros aprimorado
- **Popup de resultados** com funcionalidades avançadas:
  - Paginação customizável (25, 50, 100 linhas)
  - Ordenação por colunas
  - Exportação para CSV
  - Impressão de resultados
  - Cópia para área de transferência

### Backend:
- **Construído com NestJS** e driver oracledb
- **API RESTful** para execução de SQL e gerenciamento de arquivos
- **Criptografia/descriptografia segura** de arquivos SQL
- **Gerenciamento de conexões** Oracle otimizado
- **Geração de CSV** para exportação de dados
- **✨ Endpoint de execução direta** para SQL sem arquivo

### Destaques Técnicos:
- Frontend React moderno com design responsivo e dashboard UI
- Sistema de design consistente com componentes reutilizáveis
- Experiência do usuário aprimorada com estados de carregamento
- Manipulação segura de credenciais de banco de dados
- Suporte para resultados de query e execução de blocos PL/SQL
- Design API-first para fácil integração
- Elementos de UI internacionalizados para melhor acessibilidade

## Fluxo da Aplicação

```mermaid
flowchart TD
    Start([Usuário acessa aplicação]) --> Landing[Página Inicial]
    
    Landing --> UserLogin[Login Usuário]
    Landing --> AdminLogin[Login Admin]
    
    UserLogin --> UserDash[Dashboard Usuário]
    AdminLogin --> AdminDash[Dashboard Admin]
    
    subgraph UserDash [Dashboard do Usuário]
        UC1[Configurar Conexão BD] --> UC2[Testar Conexão]
        UC2 --> UC3[Selecionar arquivo .US]
        UC3 --> UC4[Executar SQL]
        UC4 --> UC5[Visualizar Resultados]
        UC5 --> UC6[Exportar CSV]
    end
    
    subgraph AdminDash [Dashboard do Administrador]
        AC1[Configurar Conexão BD] --> AC2[Testar Conexão]
        
        AC2 --> AC3A[Criptografar Arquivo]
        AC2 --> AC3B[Descriptografar Arquivo]
        AC2 --> AC3C[Execução Direta SQL]
        AC2 --> AC3D[Executar arquivo .US]
        
        AC3A --> AC4A[Selecionar .SQL] --> AC5A[Download .US]
        AC3B --> AC4B[Selecionar .US] --> AC5B[Visualizar conteúdo]
        AC3C --> AC4C[Escrever SQL] --> AC5C[Executar direto]
        AC3D --> AC4D[Selecionar .US] --> AC5D[Executar arquivo]
        
        AC5C --> Results[Popup de Resultados]
        AC5D --> Results
    end
    
    subgraph Results [Popup de Resultados]
        R1[Visualização tabular] --> R2[Paginação]
        R2 --> R3[Ordenação por coluna]
        R3 --> R4[Exportar CSV]
        R4 --> R5[Imprimir]
        R5 --> R6[Copiar dados]
    end
    
    subgraph Backend [API Backend]
        API1[/sql/execute - Executar .US]
        API2[/sql/encrypt - Criptografar]
        API3[/sql/decrypt - Descriptografar]
        API4[/sql/execute-direct - SQL Direto]
        API5[/sql/test-connection - Testar BD]
        API6[/sql/tns-aliases - Listar TNS]
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

### Execução de SQL
- **POST** `/sql/execute` - Executa arquivo .US criptografado
  ```json
  // FormData with:
  // - usfile: .US file
  // - user: string
  // - password: string  
  // - tnsAlias: string
  ```

- **POST** `/sql/execute-direct` - ✨ **Nova funcionalidade** - Executa SQL diretamente
  ```json
  {
    "user": "username",
    "password": "password", 
    "tnsAlias": "TNS_ALIAS",
    "sqlText": "SELECT * FROM dual"
  }
  ```

### Gerenciamento de Arquivos
- **POST** `/sql/encrypt` - Criptografa arquivo .SQL para .US
  ```json
  // FormData with:
  // - sqlfile: .SQL file
  ```

- **POST** `/sql/decrypt` - Descriptografa arquivo .US
  ```json
  // FormData with:
  // - usfile: .US file
  ```

### Utilitários
- **GET** `/sql/tns-aliases` - Lista aliases TNS disponíveis
- **POST** `/sql/test-connection` - Testa conexão com banco
  ```json
  {
    "user": "username",
    "password": "password",
    "tnsAlias": "TNS_ALIAS"
  }
  ```

## Guia do Usuário

### Página Inicial
- Escolha entre modo de acesso Usuário ou Administrador
- Interface profissional com opções de navegação claras

### Modo Usuário
1. **Configuração da Conexão:**
   - Digite suas credenciais do banco Oracle (usuário e senha)
   - Selecione um alias TNS do dropdown
   - Teste sua conexão usando o botão "Test Connection"

2. **Execução de Arquivos SQL:**
   - Faça upload de um arquivo SQL criptografado (.US)
   - Clique em "Execute File" para executar o SQL
   - Visualize os resultados na área de saída
   - Use "View Details" para ver resultados em popup detalhado

3. **Exportação de Dados:**
   - Use "Save CSV" para exportar resultados
   - No popup de resultados, acesse funcionalidades avançadas:
     - Paginação customizável
     - Ordenação por colunas
     - Exportação para CSV
     - Impressão
     - Cópia para área de transferência

### Modo Administrador
Inclui todas as funcionalidades do usuário, além de:

1. **Criptografia de Arquivos:**
   - Selecione um arquivo .SQL usando "Choose SQL File"
   - Clique em "Encrypt File" para gerar arquivo .US
   - O arquivo criptografado será baixado automaticamente

2. **Descriptografia de Arquivos:**
   - Selecione um arquivo .US já carregado
   - Clique em "Decrypt File" para visualizar o conteúdo
   - O conteúdo aparecerá no editor SQL

3. **✨ Execução Direta de SQL:**
   - Digite ou cole SQL diretamente no "SQL Query Editor"
   - Clique em "Run SQL" para executar sem necessidade de arquivo
   - Visualize resultados no mesmo popup avançado
   - Use "Clear" para limpar o editor

## Referência da API

Base URL: `http://localhost:3002`

### Endpoints de Execução SQL

- **POST** `/sql/execute`
  - **Descrição**: Executa um arquivo SQL criptografado contra banco Oracle
  - **Formato**: `multipart/form-data`
  - **Parâmetros**:
    - `user`: Usuário do banco Oracle
    - `password`: Senha do banco Oracle  
    - `tnsAlias`: Alias de conexão TNS Oracle
    - `usfile`: Arquivo SQL criptografado (formato .US)
  - **Resposta**: `{ columns: string[], data: any[][] }`

- **POST** `/sql/execute-direct` ✨ **Novo**
  - **Descrição**: Executa SQL diretamente sem arquivo
  - **Formato**: `application/json`
  - **Parâmetros**:
    - `user`: Usuário do banco Oracle
    - `password`: Senha do banco Oracle
    - `tnsAlias`: Alias de conexão TNS Oracle
    - `sqlText`: Texto SQL para executar
  - **Resposta**: `{ success: boolean, columns: string[], data: any[][] }`

- **POST** `/sql/encrypt`
  - **Descrição**: Criptografa arquivo SQL simples para formato .US
  - **Formato**: `multipart/form-data`
  - **Parâmetros**:
    - `sqlfile`: Arquivo SQL simples para criptografar
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

### ✨ v2.0.0 - Execução Direta de SQL (Agosto 2025)

#### Novas Funcionalidades
- **Execução Direta de SQL**: Administradores podem agora executar SQL diretamente sem necessidade de arquivo
  - Editor SQL integrado no dashboard admin
  - Validação de credenciais antes da execução
  - Resultados exibidos no mesmo popup avançado
- **Popup de Resultados Aprimorado**: 
  - Paginação customizável (25, 50, 100 linhas)
  - Ordenação por colunas com indicadores visuais
  - Exportação para CSV com nome personalizado
  - Funcionalidade de impressão
  - Cópia para área de transferência
- **Novo Endpoint API**: `/sql/execute-direct` para execução direta

#### Melhorias
- Interface admin reorganizada em layout de 3 colunas
- Estados de carregamento independentes para cada funcionalidade
- Melhor tratamento de erros com mensagens específicas
- Validação de parâmetros de conexão mais robusta
- Design responsivo aprimorado

#### Correções
- Corrigido problema de popup bloqueado em alguns navegadores
- Melhorada estabilidade da conexão Oracle
- Corrigidos problemas de sintaxe no frontend

### v1.0.0 - Lançamento Inicial
- Dashboard responsivo para usuários e administradores
- Execução de arquivos .US criptografados
- Criptografia/descriptografia de arquivos SQL
- Exportação para CSV
- Teste de conexão Oracle
- API RESTful completa

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
