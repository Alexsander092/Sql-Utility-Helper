import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard.css';

function LoginUser() {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Here you can implement real authentication logic
    // Simple login validation:
    if (username && pass) {
      navigate('/user');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">User Login</h2>
          <button className="modal-close" onClick={handleBackToHome}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={handleBackToHome}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginUser;
