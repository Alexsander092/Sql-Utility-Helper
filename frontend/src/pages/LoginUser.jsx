import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginUser() {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Aqui você pode implementar lógica de autenticação real.
    // Supondo login simples:
    if (username && pass) {
      navigate('/user');
    } else {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Login Usuário</h1>
      <input
        type="text"
        className="input"
        placeholder="Usuário"
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
      <button className="button execute" onClick={handleLogin}>Entrar</button>
    </div>
  );
}

export default LoginUser;
