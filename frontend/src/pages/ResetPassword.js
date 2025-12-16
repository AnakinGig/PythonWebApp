import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import httpClient from "../utils/httpClient";
import Toast from "../components/common/Toast";
import { ButtonSpinner } from "../components/common/LoadingSpinner";
import useApi from "../hooks/useApi";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { loading, callApi } = useApi();
  const [toast, setToast] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form_submited, setFormSubmited] = useState(false);
  const [password_error, setPasswordError] = useState("");
  const [confirm_password_error, setConfirmPasswordError] = useState("");

  // Password validation
  const passwordVerif = (value) => {
    if (value === "") {
      setPasswordError("Veuillez entrer un mot de passe");
      return false;
    }
    if (value.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    if (!/[A-Z]/.test(value)) {
      setPasswordError("Le mot de passe doit contenir au moins une majuscule");
      return false;
    }
    if (!/[a-z]/.test(value)) {
      setPasswordError("Le mot de passe doit contenir au moins une minuscule");
      return false;
    }
    if (!/[0-9]/.test(value)) {
      setPasswordError("Le mot de passe doit contenir au moins un chiffre");
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      setPasswordError("Le mot de passe doit contenir au moins un caractère spécial");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Confirm password validation
  const confirmPasswordVerif = (value) => {
    if (value === "") {
      setConfirmPasswordError("Veuillez confirmer votre mot de passe");
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  // Reset password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmited(true);

    const isPasswordValid = passwordVerif(password);
    const isConfirmPasswordValid = confirmPasswordVerif(confirmPassword);

    const isFormValid = isPasswordValid && isConfirmPasswordValid;

    if (isFormValid) {
      const { data: result, error: apiError } = await callApi(() =>
        httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/user/reset-password/${token}`, {
          password: password,
        })
      );

      if (result) {
        setToast({ 
          message: result.message || "Mot de passe réinitialisé avec succès !", 
          type: 'success' 
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
                <i className="bi bi-key-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3">Nouveau mot de passe</h2>
                <p className="text-muted">
                  Choisissez un mot de passe sécurisé
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    <i className="bi bi-lock me-2"></i>Nouveau mot de passe
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control form-control-lg ${
                        form_submited && password_error ? "is-invalid" : ""
                      }`}
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (form_submited) {
                          passwordVerif(e.target.value);
                          if (confirmPassword) confirmPasswordVerif(confirmPassword);
                        }
                      }}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                    {form_submited && password_error && (
                      <div className="invalid-feedback">{password_error}</div>
                    )}
                  </div>
                  <small className="text-muted">
                    8+ caractères, majuscule, minuscule, chiffre, caractère spécial
                  </small>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    <i className="bi bi-lock-fill me-2"></i>Confirmer le mot de passe
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control form-control-lg ${
                        form_submited && confirm_password_error ? "is-invalid" : ""
                      }`}
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (form_submited) confirmPasswordVerif(e.target.value);
                      }}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </button>
                    {form_submited && confirm_password_error && (
                      <div className="invalid-feedback">{confirm_password_error}</div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <ButtonSpinner /> Réinitialisation...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>Réinitialiser le mot de passe
                    </>
                  )}
                </button>
              </form>

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

export default ResetPassword;
