import { useState } from "react";
import { Link } from "react-router-dom";
import httpClient from "../utils/httpClient";
import Toast from "../components/common/Toast";
import { ButtonSpinner } from "../components/common/LoadingSpinner";
import useApi from "../hooks/useApi";

function ForgotPassword() {
  const { loading, callApi } = useApi();
  const [toast, setToast] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const [email, setEmail] = useState("");
  const [form_submited, setFormSubmited] = useState(false);
  const [email_error, setEmailError] = useState("");

  // Email validation
  const emailVerif = (value) => {
    if (value === "") {
      setEmailError("Veuillez entrer votre email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Format d'email invalide");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Request password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmited(true);

    const isEmailValid = emailVerif(email);

    if (isEmailValid) {
      const { data: result, error: apiError } = await callApi(() =>
        httpClient.post('/user/request-password-reset', {
          email: email,
        })
      );

      if (result) {
        setEmailSent(true);
        setToast({ 
          message: result.message || "Un lien de réinitialisation a été envoyé.", 
          type: 'success' 
        });
      } else {
        setToast({ message: apiError || "Une erreur est survenue.", type: 'error' });
      }
    }
  };

  return (
    <div className="container py-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3">Mot de passe oublié ?</h2>
                <p className="text-muted">
                  {emailSent 
                    ? "Email envoyé avec succès !" 
                    : "Entrez votre email pour recevoir un lien de réinitialisation"
                  }
                </p>
              </div>

              {!emailSent ? (
                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2"></i>Email
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${
                        form_submited && email_error ? "is-invalid" : ""
                      }`}
                      id="email"
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (form_submited) emailVerif(e.target.value);
                      }}
                      disabled={loading}
                    />
                    {form_submited && email_error && (
                      <div className="invalid-feedback">{email_error}</div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner /> Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>Envoyer le lien
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>Email envoyé !</strong>
                  <p className="mb-0 mt-2">
                    Si votre email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.
                  </p>
                  <hr />
                  <p className="mb-0">
                    <small>Vérifiez également votre dossier spam.</small>
                  </p>
                </div>
              )}

              {/* Back to Login */}
              <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none">
                  <i className="bi bi-arrow-left me-2"></i>
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
