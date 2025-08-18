import React, { useState } from 'react';
import './UserPage.css'; // Reutilizando o mesmo estilo do UserPage

function AdminPage() {
  // Estados e handlers para o utilitário SQL (mesmo que no UserPage)
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [tnsAlias, setTnsAlias] = useState('');
  const [file, setFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('Nenhum arquivo selecionado');
  const [results, setResults] = useState('');
  const [dataRows, setDataRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleSelectUSFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setSelectedFileName(`Arquivo selecionado: ${f.name}`);
    } else {
      setFile(null);
      setSelectedFileName('Nenhum arquivo selecionado');
    }
  };

  const handleExecute = async () => {
    if (!file) {
      alert("Nenhum arquivo SQL selecionado.");
      return;
    }

    const formData = new FormData();
    formData.append('user', user);
    formData.append('password', password);
    formData.append('tnsAlias', tnsAlias);
    formData.append('usfile', file);

    try {
      const response = await fetch('http://localhost:3000/sql/execute', {
        method: 'POST',
        body: formData
      });
      const json = await response.json();

      if (json.columns && json.columns.length > 0) {
        let header = json.columns.join(', ') + '\n';
        let body = json.data.map(row => row.join(', ')).join('\n');
        setResults(header + body);
        setDataRows(json.data);
        setColumns(json.columns);
      } else {
        setResults("Bloco PL/SQL executado com sucesso (sem resultado)");
        setDataRows([]);
        setColumns([]);
      }

    } catch (err) {
      alert(`Erro ao executar o arquivo criptografado: ${err.message}`);
    }
  };

  const handleSaveCsv = async () => {
    if (dataRows.length === 0 && (!file || file === null)) {
      alert("Nenhum dado para salvar.");
      return;
    }

    // Se não tem dados ainda, tentar executar primeiro
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

  const handleOpenResults = () => {
    if (!results) {
      alert("Nenhum resultado disponível.");
      return;
    }

    const newWindow = window.open('', '_blank', 'width=600,height=400');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Resultados</title>
            <style>
              body {
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                margin: 20px;
                white-space: pre-wrap;
              }
              h1 {
                font-size: 18px;
                margin-bottom: 10px;
              }
              pre {
                background: #f9f9f9;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 10px;
                overflow: auto;
              }
            </style>
          </head>
          <body>
            <h1>Resultados da Query</h1>
            <pre>${results}</pre>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // Estados e handlers para criptografia de arquivos .sql → .us
  const [sqlFile, setSqlFile] = useState(null);

  const handleSelectSqlFile = (e) => {
    setSqlFile(e.target.files[0] || null);
  };

  const handleEncrypt = async () => {
    if (!sqlFile) {
      alert('Selecione um arquivo .sql primeiro');
      return;
    }

    const formData = new FormData();
    formData.append('sqlfile', sqlFile);

    const response = await fetch('http://localhost:3000/sql/encrypt', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      alert('Erro ao criptografar o arquivo');
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arquivo.us';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1 className="title">Área Administrativa</h1>

      {/* Seção do utilitário SQL (mesmo código do UserPage) */}
      <input
        type="text"
        placeholder="Nome de usuário"
        className="input"
        value={user}
        onChange={e => setUser(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        className="input"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Alias TNS"
        className="input"
        value={tnsAlias}
        onChange={e => setTnsAlias(e.target.value)}
      />

      <label className="file-label">
        <span className="file-label-text">Selecionar arquivo US</span>
        <input
          type="file"
          className="file-input"
          onChange={handleSelectUSFile}
          accept=".US"
        />
      </label>
      <div className="file-info">{selectedFileName}</div>

      <div className="buttons">
        <button className="button execute" onClick={handleExecute}>Executar</button>
        <button className="button save" onClick={handleSaveCsv}>Salvar CSV</button>
        <button className="button open" onClick={handleOpenResults}>Abrir Resultados</button>
      </div>

      <textarea className="results" readOnly value={results} placeholder="Resultado da query..."></textarea>

      <hr style={{margin:'20px 0'}}/>

      {/* Seção de criptografia de arquivo .sql → .us */}
      <h2 className="title" style={{fontSize:'16px'}}>Criptografar arquivo .sql &rarr; .us</h2>
      <input
        type="file"
        className="input"
        accept=".sql"
        onChange={handleSelectSqlFile}
        style={{marginBottom:'10px'}}
      />
      <button className="button save" onClick={handleEncrypt}>Criptografar</button>
    </div>
  );
}

export default AdminPage;
