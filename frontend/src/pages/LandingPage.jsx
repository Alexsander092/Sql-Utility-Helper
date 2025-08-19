import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard.css';

function LandingPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>SQL Utility Helper</h1>
        <p>Oracle database management dashboard</p>
      </div>
      
      <div className="landing-options">
        <div className="landing-card" onClick={() => navigate('/login-user')}>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12z"/>
            </svg>
          </div>
          <h2>User Mode</h2>
          <p>Execute SQL files and view query results</p>
          <button className="btn btn-primary btn-lg btn-block">Enter as User</button>
        </div>
        
        <div className="landing-card" onClick={() => navigate('/login-admin')}>
          <div className="card-icon admin">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
            </svg>
          </div>
          <h2>Admin Mode</h2>
          <p>Manage SQL files and system settings</p>
          <button className="btn btn-secondary btn-lg btn-block">Enter as Admin</button>
        </div>
      </div>
      
      <div className="landing-footer">
        <p>© {currentYear} SQL Utility Helper • Oracle Database Management</p>
      </div>
    </div>
  );
}

export default LandingPage;
