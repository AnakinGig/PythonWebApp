import { useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../components/httpClient";
import Toast from "../components/Toast";
import { ButtonSpinner } from "../components/LoadingSpinner";
import useApi from "../components/useApi";

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
  const logUserIn = async () => {
    setFormSubmited(true);

    const isEmailValid = emailVerif(email);
    const isPasswordValid = passwordVerif(password);

    const isFormValid = isEmailValid && isPasswordValid;

    if (isFormValid){
      const { data: result, error: apiError } = await callApi(() =>
        httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/login`, {
          email: email,
          password: password,
        })
      );

      if (result) {
        setUser(result);
        navigate("/");
      } else {
        if (apiError === "Email invalide") {
          setEmailError("Email invalide");
        } else if(apiError === "Mot de passe invalide"){
          setPasswordError("Mot de passe invalide");
        } else {
          setToast({ message: apiError || "Une erreur est survenue.", type: 'error' });
        }
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
              
              <form>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Adresse mail</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={(e) => {setEmail(e.target.value);emailVerif(e.target.value)}}
                    className={`form-control form-control-lg ${email_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} 
                    placeholder="exemple@email.com"
                  />
                  <div className="invalid-feedback">{email_error}</div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Mot de passe</label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"}
                      id="password" 
                      value={password} 
                      onChange={(e) => {setPassword(e.target.value);passwordVerif(e.target.value)}} 
                      className={`form-control form-control-lg ${password_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} 
                      placeholder="Entrer votre mot de passe"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ borderLeft: 0 }}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                          <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                      )}
                    </button>
                    <div className="invalid-feedback">{password_error}</div>
                  </div>
                </div>

                <div className="d-grid mb-4">
                  <button 
                    type="button" 
                    onClick={logUserIn} 
                    disabled={loading} 
                    className="btn btn-primary btn-lg"
                  >
                    {loading ? <ButtonSpinner /> : "Se connecter"}
                  </button>
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
