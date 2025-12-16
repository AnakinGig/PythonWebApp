import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import httpClient from "../utils/httpClient";
import LoadingSpinner from "../components/common/LoadingSpinner";

function VerifyEmail({ user }) {
  const navigate = useNavigate();
  const { token } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // If already verified, block access to this page
    if (user && user.email_verified) {
      navigate('/profile');
      return;
    }

    verifyEmail();
    // eslint-disable-next-line
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await httpClient.get(
        `${process.env.REACT_APP_BACKEND_URL}/user/verify-email/${token}`
      );

      if (response.data.success) {
        setSuccess(true);
        setMessage(response.data.message || "Votre email a été vérifié avec succès !");

        // If user is logged in, send them to profile after verification
        if (user) {
          setTimeout(() => navigate('/profile'), 1200);
        }
      }
    } catch (error) {
      setSuccess(false);
      setMessage(
        error.response?.data?.error || 
        "Le lien de vérification est invalide ou a expiré."
      );
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5 text-center">
                <LoadingSpinner />
                <h4 className="mt-4">Vérification en cours...</h4>
                <p className="text-muted">Veuillez patienter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5 text-center">
              {success ? (
                <>
                  <div className="text-success mb-4">
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '5rem' }}></i>
                  </div>
                  <h2 className="text-success mb-3">Email vérifié !</h2>
                  <p className="text-muted mb-4">{message}</p>
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    Votre compte est maintenant vérifié. Accédez à votre profil pour continuer.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-danger mb-4">
                    <i className="bi bi-x-circle-fill" style={{ fontSize: '5rem' }}></i>
                  </div>
                  <h2 className="text-danger mb-3">Vérification échouée</h2>
                  <p className="text-muted mb-4">{message}</p>
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Lien expiré ou invalide</strong>
                    <p className="mb-0 mt-2">
                      Le lien de vérification a peut-être expiré (valide 24h). 
                      Vous pouvez demander un nouveau lien.
                    </p>
                  </div>
                  <Link to="/resend-verification" className="btn btn-primary btn-lg w-100 mt-3">
                    <i className="bi bi-send me-2"></i>
                    Renvoyer l'email de vérification
                  </Link>
                  <Link to="/login" className="btn btn-outline-secondary btn-lg w-100 mt-2">
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour à la connexion
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
