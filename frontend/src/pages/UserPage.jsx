import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard.css';

function UserPage({ isAdmin = false }) {
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3002';
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [tnsAlias, setTnsAlias] = useState('');
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('No file selected');
  const [sqlFile, setSqlFile] = useState(null); // For encrypt operations
  const [selectedSqlFileName, setSelectedSqlFileName] = useState('No file selected');
  const [sqlText, setSqlText] = useState(''); // For admin direct SQL input
  const [results, setResults] = useState('');
  const [dataRows, setDataRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tnsAliases, setTnsAliases] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({ connected: false, message: 'Not connected' });
  const [loading, setLoading] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('');
  const [directSqlStatus, setDirectSqlStatus] = useState('');
  const [detailedResults, setDetailedResults] = useState('');
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    // Fetch TNS aliases when component mounts
    const fetchTnsAliases = async () => {
      try {
        const response = await fetch(`${API_BASE}/sql/tns-aliases`);
        const data = await response.json();
        setTnsAliases(data.tnsAliases || []);
        if (data.tnsAliases && data.tnsAliases.length > 0) {
          setTnsAlias(data.tnsAliases[0]); // Select first TNS by default
        }
      } catch (error) {
        console.error('Error fetching TNS aliases:', error);
      }
    };
    
    fetchTnsAliases();
  }, [API_BASE]);

  const handleSelectFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setSelectedFileName(`${f.name}`);
    } else {
      setFile(null);
      setSelectedFileName('No file selected');
    }
  };

  const handleSelectSqlFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setSqlFile(f);
      setSelectedSqlFileName(`${f.name}`);
    } else {
      setSqlFile(null);
      setSelectedSqlFileName('No file selected');
    }
  };
  
  const handleTestConnection = async () => {
    if (!user || !password || !tnsAlias) {
      alert("Please fill in all connection fields");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/sql/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user,
          password,
          tnsAlias
        })
      });
      
      const result = await response.json();
      setConnectionStatus({
        connected: result.success,
        message: result.message
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };

  const handleExecute = async () => {
    if (!file) {
            setExecutionStatus('❌ ERROR: No SQL file selected');
      return;
    }

    const formData = new FormData();
    formData.append('user', user);
    formData.append('password', password);
    formData.append('tnsAlias', tnsAlias);
    formData.append('usfile', file);

    setLoading(true);
    setExecutionStatus('⏳ Executing...');
    setDetailedResults('');

    try {
      const response = await fetch(`${API_BASE}/sql/execute`, {
        method: 'POST',
        body: formData
      });
      const json = await response.json();

      if (json.columns && json.columns.length > 0) {
        let header = json.columns.join(', ') + '\n';
        let body = json.data.map(row => row.join(', ')).join('\n');
        const fullResults = header + body;
        setResults(fullResults);
        setDataRows(json.data);
        setColumns(json.columns);
        setTotalRows(json.data.length);
                setExecutionStatus('✅ SUCCESS: Query executed successfully');
        setDetailedResults(fullResults);
      } else {
        const successMessage = "PL/SQL block executed successfully (no results returned)";
        setResults(successMessage);
        setDataRows([]);
        setColumns([]);
        setTotalRows(0);
        setExecutionStatus('✅ SUCCESS: PL/SQL block executed successfully');
        setDetailedResults(successMessage);
      }

    } catch (err) {
      const errorMessage = `Error executing encrypted file: ${err.message}`;
      setExecutionStatus(`❌ ERROR: ${errorMessage}`);
      setDetailedResults(`Error: ${errorMessage}\n\nStack trace:\n${err.stack || 'No stack trace available'}`);
    } finally {
      setLoading(false);
    }
  };

  // Admin functions
  const handleEncrypt = async () => {
    if (!sqlFile) {
      alert("Please select a SQL file to encrypt");
      return;
    }

    const formData = new FormData();
    formData.append('sqlfile', sqlFile);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/sql/encrypt`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sqlFile.name.replace('.sql', '')}.us`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
                setExecutionStatus('✅ SUCCESS: File encrypted and downloaded successfully');
      } else {
                setExecutionStatus('❌ ERROR: Failed to encrypt file');
      }
    } catch (err) {
            setExecutionStatus(`❌ ERROR: Failed to encrypt file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file) {
      alert("Please select a .us file to decrypt");
      return;
    }

    const formData = new FormData();
    formData.append('usfile', file);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/sql/decrypt`, {
        method: 'POST',
        body: formData
      });
      const json = await response.json();
      
      if (json.success) {
        setSqlText(json.decryptedContent);
        setExecutionStatus('✅ SUCCESS: File decrypted successfully');
      } else {
        setExecutionStatus(`❌ ERROR: ${json.message}`);
      }
    } catch (err) {
      setExecutionStatus(`❌ ERROR: Failed to decrypt file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDirectSQL = async () => {
    // Validate SQL text
    if (!sqlText.trim()) {
      setDirectSqlStatus('❌ ERROR: No SQL text to execute');
      return;
    }
    
    // Validate connection parameters
    if (!user || !password || !tnsAlias) {
      const errorMessage = 'Please fill in all connection fields (User, Password, TNS Alias)';
      setDirectSqlStatus(`❌ ERROR: ${errorMessage}`);
      
      // Show error popup for missing connection info
      handleOpenResults({
        fileName: 'Direct SQL',
        executionStatus: `❌ ERROR: ${errorMessage}`,
        detailedResults: errorMessage,
        columns: [],
        dataRows: []
      });
      return;
    }

    setLoading(true);
    setDirectSqlStatus('⏳ Executing SQL...');
    console.log("Executing Direct SQL:", sqlText.substring(0, 50) + "...");

    try {
      const response = await fetch(`${API_BASE}/sql/execute-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user,
          password,
          tnsAlias,
          sqlText
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const json = await response.json();
      console.log("Response received:", json);

      // Explicitly check for failure from the backend
      if (json.success === false) {
        const errorMessage = json.message || 'An unknown error occurred.';
        console.error("SQL execution failed:", errorMessage);
        setDirectSqlStatus(`❌ ERROR: ${errorMessage}`);
        
        // Open popup with error
        handleOpenResults({
          fileName: 'Direct SQL',
          executionStatus: `❌ ERROR: ${errorMessage}`,
          detailedResults: errorMessage,
          columns: [],
          dataRows: []
        });
        return;
      }

      // Handle success case (with or without tabular data)
      if (json.columns && json.columns.length > 0) {
        console.log(`SQL execution succeeded with ${json.data.length} rows`);
        const fullResults = json.columns.join(', ') + '\n' + json.data.map(row => row.join(', ')).join('\n');
        const statusMessage = '✅ SUCCESS: SQL executed successfully';
        
        setDirectSqlStatus(statusMessage);
        
        handleOpenResults({
          fileName: 'Direct SQL',
          totalRows: json.data.length,
          columns: json.columns,
          dataRows: json.data,
          executionStatus: statusMessage,
          detailedResults: fullResults
        });
      } else {
        console.log("SQL executed but no results returned");
        const successMessage = "SQL executed successfully (no results returned)";
        setDirectSqlStatus('✅ SUCCESS: ' + successMessage);
        
        handleOpenResults({
          fileName: 'Direct SQL',
          executionStatus: '✅ SUCCESS: ' + successMessage,
          detailedResults: successMessage,
          columns: [],
          dataRows: []
        });
      }

    } catch (err) {
      console.error("Error in direct SQL execution:", err);
      const errorMessage = `Error executing SQL: ${err.message}`;
      setDirectSqlStatus(`❌ ERROR: ${errorMessage}`);
      
      // Open popup with error
      handleOpenResults({
        fileName: 'Direct SQL',
        executionStatus: `❌ ERROR: ${errorMessage}`,
        detailedResults: errorMessage,
        columns: [],
        dataRows: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCsv = async () => {
    if (dataRows.length === 0 && (!file || file === null)) {
      alert("No data to save.");
      return;
    }

    // If no data, try to execute first
    if (dataRows.length === 0 && file) {
      await handleExecute(); 
      if (dataRows.length === 0) return;
    }

    let csv = columns.join(',') + '\n';
    dataRows.forEach(row => {
      csv += row.map(val => `"${val}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultado.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleOpenResults = (override = null) => {
    console.log("handleOpenResults called with override:", override ? "present" : "null");
    
    // Check if we have results to show
    const hasStateResults = detailedResults || executionStatus;
    if (!hasStateResults && !override) {
      alert("No results available. Please execute a query first.");
      return;
    }

    // Prepare data for display
    const timestamp = new Date().toLocaleString();
    const fName = override?.fileName || (file ? file.name : 'Unknown file');
    const cols = override?.columns || columns || [];
    const rows = override?.dataRows || dataRows || [];
    const tRows = typeof override?.totalRows === 'number' ? override.totalRows : (Array.isArray(rows) ? rows.length : totalRows);
    const status = override?.executionStatus != null ? override.executionStatus : executionStatus;
    const details = override?.detailedResults != null ? override.detailedResults : detailedResults;
    const hasTabularData = tRows > 0 && cols.length > 0;
    
    console.log("Opening results window with:", {
      fileName: fName,
      columns: cols.length,
      rows: Array.isArray(rows) ? rows.length : 0,
      hasTabularData
    });
    
    // Open popup window
    const newWindow = window.open('', '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
    if (!newWindow) {
      alert("Popup was blocked! Please allow popups for this site.");
      return;
    }
      const detailRowsPerPage = 50;
      const detailTotalPages = hasTabularData ? Math.ceil(tRows / detailRowsPerPage) : 0;
      
      let gridHTML = '';
      if (hasTabularData) {
        gridHTML = `
          <div class="data-section">
            <div class="data-header">
              <h3>📊 Query Results (${tRows} rows)</h3>
              <div class="pagination-info">Page 1 of ${detailTotalPages}</div>
            </div>
            
            <div class="pagination-controls">
              <select id="rowsSelect" onchange="changeRowsPerPage(this.value)">
                <option value="25">25 rows</option>
                <option value="50" selected>50 rows</option>
                <option value="100">100 rows</option>
              </select>
              <div class="pagination-buttons">
                <button onclick="changePage(1)" id="firstBtn">⏮️ First</button>
                <button onclick="changePage(currentPage - 1)" id="prevBtn">⬅️ Prev</button>
                <span id="pageInfo">Page 1 of ${detailTotalPages}</span>
                <button onclick="changePage(currentPage + 1)" id="nextBtn">Next ➡️</button>
                <button onclick="changePage(${detailTotalPages})" id="lastBtn">Last ⏭️</button>
              </div>
            </div>
            
            <div class="table-container">
              <table class="results-table" id="dataTable">
                <thead>
                  <tr>
                    <th style="width: 60px; text-align: center;">#</th>
                    ${cols.map((col, index) => `
                      <th style="cursor: pointer; user-select: none;" onclick="sortColumn(${index})" title="Click to sort">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                          <span>${col}</span>
                          <span id="sort-${index}" style="margin-left: 8px; opacity: 0.5;">⇅</span>
                        </div>
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody id="tableBody">
                  <!-- Data will be populated by JavaScript -->
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      let rawOutputHtml = '';
      if (!hasTabularData && details) {
          rawOutputHtml = `
              <div class="data-section">
                <h3>📝 Raw Output</h3>
                <div class="raw-results">${details}</div>
              </div>
          `;
      }

      const statusBorderColor = (status || '').includes('✅') ? '#10b981' : '#ef4444';

      newWindow.document.write(`
        <html>
          <head>
            <title>📊 SQL Results - ${fName}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                line-height: 1.6;
              }
              
              .container {
                max-width: 1600px;
                margin: 0 auto;
                padding: 20px;
              }
              
              header {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                color: #333;
                padding: 30px;
                margin-bottom: 30px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
              
              h1 {
                font-size: 28px;
                margin: 0 0 20px 0;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              
              .meta-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                font-size: 14px;
                background: rgba(103, 126, 234, 0.1);
                padding: 20px;
                border-radius: 15px;
                border: 1px solid rgba(103, 126, 234, 0.2);
              }
              
              .meta-info div {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .meta-info strong {
                color: #667eea;
                font-weight: 600;
              }
              
              .status-section {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 25px;
                margin-bottom: 25px;
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
              
              .status-section h3 {
                margin: 0 0 15px 0;
                color: #374151;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
              }
              
              .status-section div {
                font-size: 16px;
                color: #6b7280;
                padding: 15px;
                background: rgba(249, 250, 251, 0.8);
                border-radius: 12px;
                border: 1px solid rgba(229, 231, 235, 0.5);
              }
              
              .data-section {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                padding: 30px;
                margin-bottom: 30px;
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
              
              .data-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid rgba(103, 126, 234, 0.2);
              }
              
              .data-header h3 {
                margin: 0;
                color: #374151;
                font-weight: 700;
                font-size: 20px;
              }
              
              .pagination-info {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
              }
              
              .pagination-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
                padding: 20px;
                background: rgba(249, 250, 251, 0.8);
                border-radius: 15px;
                border: 1px solid rgba(229, 231, 235, 0.5);
              }
              
              .pagination-controls select {
                padding: 10px 15px;
                border: 2px solid rgba(103, 126, 234, 0.3);
                background: white;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              
              .pagination-controls select:hover {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(103, 126, 234, 0.1);
              }
              
              .pagination-buttons {
                display: flex;
                gap: 8px;
                align-items: center;
              }
              
              .pagination-buttons button {
                padding: 10px 16px;
                border: 2px solid rgba(103, 126, 234, 0.3);
                background: white;
                cursor: pointer;
                border-radius: 10px;
                font-size: 13px;
                font-weight: 500;
                color: #374151;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 5px;
              }
              
              .pagination-buttons button:hover:not(:disabled) {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-color: transparent;
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(103, 126, 234, 0.3);
              }
              
              .pagination-buttons button:disabled {
                opacity: 0.4;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
              }
              
              .pagination-buttons span {
                margin: 0 15px;
                font-weight: 600;
                font-size: 14px;
                color: #374151;
                padding: 8px 16px;
                background: rgba(103, 126, 234, 0.1);
                border-radius: 10px;
              }
              
              .table-container {
                overflow: auto;
                max-height: 600px;
                border-radius: 15px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(229, 231, 235, 0.5);
              }
              
              .results-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
                background: white;
              }
              
              .results-table thead {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                position: sticky;
                top: 0;
                z-index: 10;
              }
              
              .results-table th {
                padding: 15px 12px;
                text-align: left;
                border-bottom: 2px solid rgba(103, 126, 234, 0.2);
                font-weight: 700;
                color: #374151;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: background-color 0.2s ease;
              }
              
              .results-table th:hover {
                background-color: rgba(103, 126, 234, 0.1);
              }
              
              .results-table th[onclick] {
                background-color: rgba(103, 126, 234, 0.05);
              }
              
              .results-table th[onclick]:hover {
                background-color: rgba(103, 126, 234, 0.15);
              }
              
              .results-table td {
                padding: 12px;
                border-bottom: 1px solid rgba(229, 231, 235, 0.5);
                max-width: 250px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #6b7280;
              }
              
              .results-table tbody tr:nth-child(even) {
                background-color: rgba(249, 250, 251, 0.5);
              }
              
              .results-table tbody tr:hover {
                background-color: rgba(103, 126, 234, 0.05);
                transform: scale(1.001);
                transition: all 0.2s ease;
              }
              
              .actions {
                margin: 30px 0;
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
              }
              
              .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              }
              
              .btn-primary {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: 2px solid transparent;
              }
              
              .btn-primary:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 30px rgba(103, 126, 234, 0.4);
              }
              
              .raw-results {
                background: rgba(249, 250, 251, 0.8);
                border: 2px solid rgba(229, 231, 235, 0.5);
                border-radius: 15px;
                padding: 25px;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-size: 13px;
                white-space: pre-wrap;
                max-height: 400px;
                overflow: auto;
                line-height: 1.6;
                color: #374151;
              }
              
              @media (max-width: 768px) {
                .container {
                  padding: 15px;
                }
                
                header {
                  padding: 20px;
                }
                
                h1 {
                  font-size: 24px;
                }
                
                .meta-info {
                  grid-template-columns: 1fr;
                  gap: 15px;
                }
                
                .pagination-controls {
                  flex-direction: column;
                  align-items: stretch;
                }
                
                .pagination-buttons {
                  justify-content: center;
                  flex-wrap: wrap;
                }
                
                .actions {
                  justify-content: center;
                }
                
                .results-table th,
                .results-table td {
                  padding: 10px 8px;
                  font-size: 12px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <header>
                <h1>📊 SQL Execution Results</h1>
                <div class="meta-info">
                  <div><strong>📄 File:</strong> ${fName}</div>
                  <div><strong>🗄️ Database:</strong> ${tnsAlias}</div>
                  <div><strong>👤 User:</strong> ${user}</div>
                  <div><strong>🕒 Timestamp:</strong> ${timestamp}</div>
                </div>
              </header>
              
              <div class="status-section" style="border-left: 6px solid ${statusBorderColor};">
                <h3>📋 Execution Status</h3>
                <div>${status || 'No status available'}</div>
              </div>
              
              ${gridHTML}
              
              ${rawOutputHtml}
              
              <div class="actions">
                <button class="btn btn-primary" onclick="window.print()">🖨️ Print</button>
                <button class="btn btn-primary" onclick="copyResults()">📋 Copy All</button>
                ${hasTabularData ? '<button class="btn btn-primary" onclick="exportCSV()">💾 Export CSV</button>' : ''}
              </div>
            </div>
            
            <script>
              let currentPage = 1;
              let rowsPerPage = 50;
              const totalRows = ${tRows};
              const columns = ${JSON.stringify(cols)};
              let data = ${JSON.stringify(rows)};
              const fNameForExport = '${fName}';
              let sortColumnIndex = -1;
              let sortDirection = 'asc';
              
              function getTotalPages() {
                return Math.ceil(data.length / rowsPerPage);
              }
              
              function sortColumn(columnIndex) {
                if (sortColumnIndex === columnIndex) {
                  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                  sortDirection = 'asc';
                }
                sortColumnIndex = columnIndex;

                for (let i = 0; i < columns.length; i++) {
                  const indicator = document.getElementById('sort-' + i);
                  if (indicator) {
                    if (i === columnIndex) {
                      indicator.textContent = sortDirection === 'asc' ? '↑' : '↓';
                      indicator.style.opacity = '1';
                      indicator.style.color = '#667eea';
                    } else {
                      indicator.textContent = '⇅';
                      indicator.style.opacity = '0.5';
                    }
                  }
                }
                
                const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                data.sort((a, b) => {
                  const aVal = a && a.length > columnIndex ? a[columnIndex] : '';
                  const bVal = b && b.length > columnIndex ? b[columnIndex] : '';
                  const comparison = collator.compare(String(aVal), String(bVal));
                  return sortDirection === 'asc' ? comparison : -comparison;
                });
                
                currentPage = 1;
                renderTable();
                updatePaginationButtons();
              }
              
              function changePage(newPage) {
                const totalPages = getTotalPages();
                if (newPage >= 1 && newPage <= totalPages) {
                  currentPage = newPage;
                  renderTable();
                  updatePaginationButtons();
                }
              }
              
              function changeRowsPerPage(newRowsPerPage) {
                rowsPerPage = parseInt(newRowsPerPage);
                currentPage = 1;
                renderTable();
                updatePaginationButtons();
              }
              
              function renderTable() {
                const startIndex = (currentPage - 1) * rowsPerPage;
                const endIndex = startIndex + rowsPerPage;
                const pageData = data.slice(startIndex, endIndex);
                
                const tbody = document.getElementById('tableBody');
                if (!tbody) return;
                tbody.innerHTML = '';

                if (pageData.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="' + (columns.length + 1) + '" style="text-align:center;padding:20px;">No data to display.</td></tr>';
                    return;
                }

                let tableHtml = '';
                pageData.forEach((row, index) => {
                  if (!Array.isArray(row)) return;
                  const rowNum = startIndex + index + 1;
                  let cellsHtml = '';
                  row.forEach(cell => {
                      const cellValue = (cell !== null && cell !== undefined) ? String(cell) : '';
                      const escapedValue = cellValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                      cellsHtml += '<td title="' + escapedValue + '">' + escapedValue + '</td>';
                  });
                  tableHtml += '<tr><td style="text-align: center; font-size: 11px; color: #666;">' + rowNum + '</td>' + cellsHtml + '</tr>';
                });
                tbody.innerHTML = tableHtml;
                
                const actualTotalPages = getTotalPages();
                const pageInfoSpan = document.getElementById('pageInfo');
                if(pageInfoSpan) pageInfoSpan.textContent = 'Page ' + currentPage + ' of ' + actualTotalPages;
                
                const paginationInfoDiv = document.querySelector('.pagination-info');
                if (paginationInfoDiv) {
                  paginationInfoDiv.textContent = 'Page ' + currentPage + ' of ' + actualTotalPages;
                }
              }
              
              function updatePaginationButtons() {
                const totalPages = getTotalPages();
                document.getElementById('firstBtn').disabled = currentPage === 1;
                document.getElementById('prevBtn').disabled = currentPage === 1;
                document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
                document.getElementById('lastBtn').disabled = currentPage === totalPages || totalPages === 0;
              }
              
              function copyResults() {
                const text = data.map(row => row.join('\\t')).join('\\n');
                navigator.clipboard.writeText(columns.join('\\t') + '\\n' + text);
                alert('Results copied to clipboard!');
              }
              
              function exportCSV() {
                const csv = columns.join(',') + '\\n' + data.map(row => row.map(cell => '"' + (cell || '').replace(/"/g, '""') + '"').join(',')).join('\\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fNameForExport.replace('.us', '') + '_results.csv';
                a.click();
                URL.revokeObjectURL(url);
              }
              
              if (${hasTabularData} && Array.isArray(data)) {
                renderTable();
                updatePaginationButtons();
              }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="main-content">
          <div className="content-header">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h1 style={{margin: '0'}}>{isAdmin ? 'Admin Dashboard' : 'User Dashboard'}</h1>
              <button className="btn btn-outline" onClick={handleBackToHome}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
                  <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
                  <path d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
                </svg>
                Back to Home
              </button>
            </div>
          </div>
          
          <div className="row">
            {/* Database Connection */}
            <div className="col-6">
              <div className="card">
                <div className="card-header">
                                    <h3 className="card-title">🔌 Database Connection</h3>
                </div>
                <div className="card-content">
                  <div className="form-group">
                    <label className="form-label">Database User</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">TNS Alias</label>
                    <select 
                      className="form-control" 
                      value={tnsAlias}
                      onChange={(e) => setTnsAlias(e.target.value)}
                    >
                      {tnsAliases.map((alias, index) => (
                        <option key={index} value={alias}>{alias}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="connection-status-simple">
                    <span className={`status-indicator ${connectionStatus.connected ? 'connected' : 'disconnected'}`}>
                                            {connectionStatus.connected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                  </div>
                  <div className="button-group" style={{marginTop: '10px'}}>
                    <button 
                      className="btn btn-info btn-standard" 
                      onClick={handleTestConnection}
                      disabled={loading}
                    >
                      🔗 Test Connection
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SQL File Execution */}
            <div className="col-6">
              <div className="card">
                <div className="card-header">
                                    <h3 className="card-title">⚡ SQL File Execution</h3>
                </div>
                <div className="card-content">
                  <div className="form-group">
                    <label className="form-label">Select Encrypted SQL File (.us)</label>
                    <label className="form-file-label">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                      </svg>
                      Choose .US File
                      <input
                        type="file"
                        className="form-file-input"
                        accept=".us"
                        onChange={handleSelectFile}
                      />
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">File Status</label>
                    <div className="simple-status">
                      {file ? `✅ ${selectedFileName}` : '📁 No file selected'}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Execution Status</label>
                    <div className="simple-status">
                      {executionStatus ? executionStatus : 'Ready to execute...'}
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="button-group">
                    <button 
                      className="btn btn-primary btn-standard" 
                      onClick={handleExecute}
                      disabled={loading || !file}
                    >
                      {loading ? '⏳ Executing...' : '▶️ Execute File'}
                    </button>
                    <button 
                      className="btn btn-info btn-standard" 
                      onClick={handleSaveCsv}
                      disabled={dataRows.length === 0}
                    >
                      💾 Save CSV
                    </button>
                    <button 
                      className="btn btn-secondary btn-standard" 
                      onClick={() => handleOpenResults()}
                      disabled={!detailedResults && !results}
                    >
                      📋 View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Only Section - File Management & Direct SQL */}
          {isAdmin && (
            <div className="row">
              {/* File Encryption */}
              <div className="col-4">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">🔒 Encrypt SQL File</h3>
                  </div>
                  <div className="card-content">
                    <div className="form-group">
                      <label className="form-label">Select SQL File to Encrypt</label>
                      <label className="form-file-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
                          <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                        </svg>
                        Choose SQL File
                        <input
                          type="file"
                          className="form-file-input"
                          accept=".sql"
                          onChange={handleSelectSqlFile}
                        />
                      </label>
                    </div>
                    
                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">Status</label>
                      <div className="simple-status">
                        {sqlFile ? `✅ ${selectedSqlFileName}` : '📄 No file selected'}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button 
                      className="btn btn-warning btn-standard" 
                      onClick={handleEncrypt}
                      disabled={loading || !sqlFile}
                      style={{width: '100%'}}
                    >
                      🔒 Encrypt File
                    </button>
                  </div>
                </div>
              </div>

              {/* File Decryption */}
              <div className="col-4">
                <div className="card">
                  <div className="card-header">
                                        <h3 className="card-title">🔓 Decrypt .US File</h3>
                  </div>
                  <div className="card-content">
                    <div className="form-group">
                      <label className="form-label">Selected .US File</label>
                      <div className="simple-status">
                        {file ? `✅ ${selectedFileName}` : '📁 No file selected'}
                      </div>
                    </div>

                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">Status</label>
                      <div className="simple-status">
                                                {sqlText ? '✅ Content loaded' : '⏳ Ready to decrypt'}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button 
                      className="btn btn-info btn-standard" 
                      onClick={handleDecrypt}
                      disabled={loading || !file}
                      style={{width: '100%'}}
                    >
                      🔓 Decrypt File
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct SQL Execution */}
              <div className="col-4">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">⚡ Direct SQL Execution</h3>
                  </div>
                  <div className="card-content">
                    <div className="form-group" style={{flex: 1}}>
                      <label className="form-label">SQL Query Editor</label>
                      <textarea
                        className="form-control"
                        rows="6"
                        value={sqlText}
                        onChange={(e) => setSqlText(e.target.value)}
                        placeholder="Enter SQL query directly or decrypt a .us file..."
                        style={{
                          fontFamily: 'monospace', 
                          fontSize: '12px', 
                          resize: 'vertical',
                          minHeight: '140px'
                        }}
                      />
                    </div>
                    {directSqlStatus && (
                      <div className={`status-message ${directSqlStatus.includes('✅') ? 'success' : directSqlStatus.includes('❌') ? 'error' : 'info'}`}>
                        <div className="status-content">{directSqlStatus}</div>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                      <button 
                        className="btn btn-success" 
                        onClick={handleExecuteDirectSQL}
                        disabled={loading || !sqlText.trim()}
                        style={{flex: 1}}
                      >
                        ▶️ Run SQL
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setSqlText('')}
                        disabled={!sqlText.trim()}
                        style={{flex: 1}}
                      >
                        🗑️ Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPage;