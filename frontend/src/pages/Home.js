import React, { useState } from "react";
import BrandingConfig from "../config/branding";
import httpClient from "../utils/httpClient";
import Toast from "../components/common/Toast";
import { ButtonSpinner } from "../components/common/LoadingSpinner";
import useApi from "../hooks/useApi";

const Home = ({ user }) => {
  const { loading, callApi } = useApi();
  const [toast, setToast] = useState(null);

  const handleResendVerification = async () => {
    const { data: result, error: apiError } = await callApi(() =>
      httpClient.post('/user/resend-verification')
    );

    if (result) {
      setToast({ 
        message: "Un nouveau lien de vérification a été envoyé.", 
        type: 'success' 
      });
    } else {
      setToast({ message: apiError || "Une erreur est survenue.", type: 'error' });
    }
  };

  return (
    <div className="container py-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Hero Section */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">
              {BrandingConfig.appTagline}
            </h1>
            <p className="lead text-muted">
              {BrandingConfig.appDescription}
            </p>
          </div>

          {!user ? (
            /* Not Logged In */
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card h-100 border-primary">
                  <div className="card-body text-center p-4">
                    <div className="display-1 mb-3">🔐</div>
                    <h4 className="card-title mb-3">Vous n'êtes pas connecté</h4>
                    <p className="card-text text-muted mb-4">
                      Connectez-vous pour accéder à votre espace personnel
                    </p>
                    <a href="/login" className="btn btn-primary btn-lg">
                      Se connecter
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100 border-success">
                  <div className="card-body text-center p-4">
                    <div className="display-1 mb-3">✨</div>
                    <h4 className="card-title mb-3">Nouveau sur la plateforme ?</h4>
                    <p className="card-text text-muted mb-4">
                      Créez votre compte gratuitement en quelques clics
                    </p>
                    <a href="/register" className="btn btn-success btn-lg">
                      Créer un compte
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Logged In */
            <div>
              {/* Email Verification Alert */}
              {user && !user.email_verified && (
                <div className="alert alert-warning border-0 shadow-sm mb-4" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2" style={{fontSize: '1.5rem'}}></i>
                    <div className="flex-grow-1">
                      <h5 className="alert-heading mb-1">Email non vérifié</h5>
                      <p className="mb-0">
                        Veuillez vérifier votre adresse email pour accéder à toutes les fonctionnalités. 
                        Vérifiez votre boîte de réception et vos spams.
                      </p>
                    </div>
                    <button 
                      onClick={handleResendVerification} 
                      disabled={loading}
                      className="btn btn-warning ms-3"
                    >
                      {loading ? (
                        <>
                          <ButtonSpinner /> Envoi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>Renvoyer l'email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{width: '60px', height: '60px', fontSize: '24px'}}>
                      {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
                    </div>
                    <div>
                      <h3 className="mb-1">Bonjour, {user.first_name} {user.last_name}</h3>
                      <p className="text-muted mb-0">Content de vous revoir !</p>
                    </div>
                  </div>

                  {user.role === 'Administrateur' && (
                    <div className="mt-4 pt-4 border-top">
                      <h5 className="mb-3">Accès rapide</h5>
                      <div className="d-flex gap-2 flex-wrap">
                        <a href="/admin/dashboard" className="btn btn-outline-primary">
                          Tableau de bord
                        </a>
                        <a href="/admin/users" className="btn btn-outline-primary">
                          Utilisateurs
                        </a>
                        <a href="/admin/activity-logs" className="btn btn-outline-primary">
                          Activité
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Section */}
              <div className="row g-4 mt-4">
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="fs-1 mb-3">🚀</div>
                      <h5 className="card-title">Performances</h5>
                      <p className="card-text text-muted small">
                        Application rapide et optimisée
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="fs-1 mb-3">🔒</div>
                      <h5 className="card-title">Sécurité</h5>
                      <p className="card-text text-muted small">
                        Vos données sont protégées
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="fs-1 mb-3">⚡</div>
                      <h5 className="card-title">Moderne</h5>
                      <p className="card-text text-muted small">
                        Technologies de pointe
                      </p>
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
};

export default Home;
