import { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../utils/httpClient";
import Toast from "../components/common/Toast";
import { ButtonSpinner } from "../components/common/LoadingSpinner";
import useApi from "../hooks/useApi";

function Login({ setUser }) {
  const navigate = useNavigate();
  const { loading, callApi } = useApi();
  const [toast, setToast] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form_submited, setFormSubmited] = useState(false);
  const [email_error, setEmailError] = useState("");
  const [password_error, setPasswordError] = useState("");

  // ### User input verifications ###
  const emailVerif = (value) => {
    if (value === "") {
      setEmailError("Veuillez entrer votre email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const passwordVerif = (value) => {
    if (value === "") {
      setPasswordError("Veuillez entrer votre mot de passe");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // ### Log user in ###
  const logUserIn = async (e) => {
    e.preventDefault();
    setFormSubmited(true);

    const isEmailValid = emailVerif(email);
    const isPasswordValid = passwordVerif(password);

    const isFormValid = isEmailValid && isPasswordValid;

    if (isFormValid) {
      const { data: result, error: apiError } = await callApi(() =>
        httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
          email: email,
          password: password,
        })
      );

      if (result) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = "/";
      } else {
        const errorMsg = apiError || "Une erreur est survenue.";
        setToast({ message: errorMsg, type: 'error' });
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
                <h2 className="fw-bold mb-2">Connexion</h2>
                <p className="text-body-secondary">Connectez-vous à votre compte</p>
              </div>
              
              <form onSubmit={logUserIn}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Adresse mail</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (form_submited) emailVerif(e.target.value);
                    }}
                    className={`form-control form-control-lg ${
                      form_submited && email_error ? "is-invalid" : ""
                    }`} 
                    placeholder="exemple@email.com"
                    disabled={loading}
                  />
                  {form_submited && email_error && (
                    <div className="invalid-feedback">{email_error}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Mot de passe</label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"}
                      id="password" 
                      value={password} 
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (form_submited) passwordVerif(e.target.value);
                      }} 
                      className={`form-control form-control-lg ${
                        form_submited && password_error ? "is-invalid" : ""
                      }`} 
                      placeholder="Entrer votre mot de passe"
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
                </div>

                <div className="d-grid mb-4">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn btn-primary btn-lg"
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner /> Connexion...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>Se connecter
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mb-3">
                  <a href="/forgot-password" className="text-decoration-none">
                    Mot de passe oublié ?
                  </a>
                </div>

                <div className="text-center">
                  <p className="mb-0 text-body-secondary">
                    Vous n'avez pas de compte?{" "}
                    <a href="./register" className="text-primary fw-semibold text-decoration-none">
                      Créer un compte
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
