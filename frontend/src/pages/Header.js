import { useEffect, useState } from "react";
import httpClient from "../httpClient";
import logo from '../assets/logo.jpg'

function Header() {

    const currentPagePath = window.location.pathname;
    const currentPage = currentPagePath.split('/').pop();

    const [user, setUser] = useState();

    const logUserOut = async () => {
        httpClient.post("//localhost:5000/logout")
        .then(window.location.href = "/")
    }
    
    const getUserInfo = async () => {
        try {
            const resp = await httpClient.get("//localhost:5000/@me");
            if (resp.data.error) {
                setUser(null);
            } else {
                setUser(resp.data);
            }
        } catch (error) {
            console.log("Erreur lors de la récupération de l'utilisateur :", error);
            setUser(null);
        }
    }
    
    useEffect( ()=> {
        getUserInfo()
    },[]);

  return (
    <div>
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="d-flex flex-row justify-content-between mx-4 w-100">
                <div>
                    <a className="navbar-brand me-2" href="/">
                        <img src={logo} height="32" alt="Logo"/>
                    </a>

                    <button data-mdb-collapse-init className="navbar-toggler" type="button">
                        <i className="fas fa-bars"></i>
                    </button>
                </div>

                <div className="collapse navbar-collapse">
                    
                        {user != null && user.role === 'Administrateur' ? (
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <a className="nav-link" href="/">{currentPage === '' ? (<u>Home</u>) : ('Home')}</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="/admin/dashboard">{currentPage === 'dashboard' ? (<u>Admin</u>) : ('Admin')}</a>
                                </li>
                            </ul>
                        ) : (
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <a className="nav-link" href="/">{currentPage === '' ? (<u>Home</u>) : ('Home')}</a>
                                </li>
                            </ul>
                        )}

                    {user == null ? (
                        <div className="d-flex align-items-center">
                            <a href="/login" data-mdb-ripple-init type="button" className="btn btn-link px-3 me-2"> Se connecter </a>
                            <a href="/register" data-mdb-ripple-init type="button" className="btn btn-primary me-3"> Créer un compte </a>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <button data-mdb-ripple-init type="button" onClick={logUserOut} className="btn btn-danger px-3 me-2"> Se déconnecter </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
        <div className='container mt-4'>
        </div>
    </div>
  );
}

export default Header;
