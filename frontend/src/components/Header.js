import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import httpClient from "../components/httpClient";
import logo from "../assets/logo.jpg";

function Header({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logUserOut = async () => {
    await httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/logout`);
    setUser(null);
    navigate("/");
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src={logo} height="32" alt="Logo" />
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {user && user.role === "Administrateur" ? (
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link" href="/">{location.pathname === "/" ? <u>Home</u> : "Home"}</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/admin/dashboard">{location.pathname === "/admin/dashboard" ? (<u>Tableau de bord</u>) : ("Tableau de bord")}</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/admin/users">{location.pathname === "/admin/users" ? (<u>Utilisateurs</u>) : ("Utilisateurs")}</a>
                </li>
              </ul>
            ) : (
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link" href="/">{location.pathname === "" ? <u>Home</u> : "Home"}</a>
                </li>
              </ul>
            )}

            {!user ? (
              <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center ms-auto">
                <a href="/login" className="btn btn-link px-3 me-2 mb-2 mb-lg-0">Se connecter</a>
                <a href="/register" className="btn btn-primary me-lg-3">Créer un compte</a>
              </div>
            ) : (
              <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center ms-auto">
                <span className="navbar-text me-3 mb-2 mb-lg-0">{user.first_name} {user.last_name}</span>
                <button type="button" onClick={logUserOut} className="btn btn-danger px-3">Se déconnecter</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
