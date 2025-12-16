import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import httpClient from "../../utils/httpClient";
import logo from "../../assets/basic-logo.png";
import { useTheme } from "../../context/ThemeContext";
import BrandingConfig from "../../config/branding";

function Header({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const logUserOut = async () => {
    await httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`);
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img src={logo} height="32" alt="Logo" className="me-2" />
          <span className="fw-bold d-none d-md-inline">{BrandingConfig.appName}</span>
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Navigation Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className={`nav-link ${isActive('/') ? 'active fw-bold' : ''}`} href="/">
                Accueil
              </a>
            </li>
            
            {user && user.role === "Administrateur" && (
              <>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/admin/dashboard') ? 'active fw-bold' : ''}`} href="/admin/dashboard">
                    Tableau de bord
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/admin/users') ? 'active fw-bold' : ''}`} href="/admin/users">
                    Utilisateurs
                  </a>
                </li>
                <li className="nav-item">
                  <a className={`nav-link ${isActive('/admin/activity-logs') ? 'active fw-bold' : ''}`} href="/admin/activity-logs">
                    Activité
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className="nav-link" 
                    href={`${process.env.REACT_APP_BACKEND_URL}/docs`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    API Docs
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Right Side Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-outline-secondary btn-sm"
              title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
              style={{minWidth: '40px'}}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {!user ? (
              <>
                <a href="/login" className="btn btn-outline-primary btn-sm">Se connecter</a>
                <a href="/register" className="btn btn-primary btn-sm">Créer un compte</a>
              </>
            ) : (
              <>
                <div className="dropdown d-none d-lg-flex">
                  <button 
                    className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-0"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{color: 'inherit'}}
                  >
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style={{width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold', flexShrink: 0}}>
                      {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
                    </div>
                    <div className="text-start">
                      <div className="fw-semibold" style={{fontSize: '0.875rem', lineHeight: '1.2'}}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-muted" style={{fontSize: '0.75rem', lineHeight: '1'}}>
                        {user.role}
                      </div>
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="/profile">
                        <i className="bi bi-person-circle me-2"></i>Mon Profil
                      </a>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        type="button" 
                        onClick={logUserOut} 
                        className="dropdown-item text-danger"
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Se déconnecter
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Mobile view */}
                <div className="d-flex d-lg-none gap-2">
                  <a href="/profile" className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-person"></i>
                  </a>
                  <button type="button" onClick={logUserOut} className="btn btn-danger btn-sm">
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
