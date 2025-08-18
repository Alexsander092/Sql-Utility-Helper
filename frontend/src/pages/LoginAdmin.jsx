import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginAdmin() {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Validação simplificada
    if (username === 'admin' && pass === 'admin') {
      navigate('/admin');
    } else {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Login Admin</h1>
      <input
        type="text"
        className="input"
        placeholder="Admin"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="input"
        placeholder="Senha"
        value={pass}
        onChange={e => setPass(e.target.value)}
      />
      <button className="button save" onClick={handleLogin}>Entrar</button>
    </div>
  );
}

export default LoginAdmin;
