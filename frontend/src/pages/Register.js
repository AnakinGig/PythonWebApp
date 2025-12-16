import { useState } from "react";
import httpClient from "../utils/httpClient";
import { useNavigate } from "react-router-dom";
import Toast from "../components/common/Toast";
import { ButtonSpinner } from "../components/common/LoadingSpinner";
import useApi from "../hooks/useApi";

const Register = ({ setUser }) => {
  const navigate = useNavigate();
  const { loading, callApi } = useApi();

  const [email, setEmail] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const [form_submited, setFormSubmited] = useState(false);
  const [first_name_error, setFirstNameError] = useState("");
  const [last_name_error, setLastNameError] = useState("");
  const [email_error, setEmailError] = useState("");
  const [password_error, setPasswordError] = useState("");


  // ### User input verifications ###
  const firstNameVerif = (value) => {
    if (value === "") {
      setFirstNameError("Veuillez entrer votre prénom");
      return false;
    }
    setFirstNameError("");
    return true;
  };

  const lastNameVerif = (value) => {
    if (value === "") {
      setLastNameError("Veuillez entrer votre nom");
      return false;
    }
    setLastNameError("");
    return true;
  };

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

  const passwordVerif = (value) => {
    if (value === "") {
      setPasswordError("Veuillez entrer votre mot de passe");
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(value)) {
      setPasswordError(
        "Le mot de passe doit contenir au moins 8 caractères et doit inclure une majuscule, une minuscule, un chiffre et un caractère spécial."
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  // ### Register user in ###
  const registerUserIn = async (e) => {
    e.preventDefault();
    setFormSubmited(true);

    const isFirstNameValid = firstNameVerif(first_name);
    const isLastNameValid = lastNameVerif(last_name);
    const isEmailValid = emailVerif(email);
    const isPasswordValid = passwordVerif(password);

    const isFormValid =
      isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid;

    if (isFormValid) {
      const { data: result, error: apiError } = await callApi(() =>
        httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, {
          email: email,
          first_name: first_name,
          last_name: last_name,
          password: password,
        })
      );

      if (result) {
        localStorage.setItem('isLoggedIn', 'true');
        setUser(result.data); // Use result.data to get the actual user object
        navigate("/");
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
        <div className="col-lg-6 col-md-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Créer un compte</h2>
                <p className="text-body-secondary">Rejoignez-nous dès aujourd'hui</p>
              </div>
              
              <form onSubmit={registerUserIn}>
                <div className="row mb-4">
                  <div className="col-md-6 mb-4 mb-md-0">
                    <label className="form-label fw-semibold">Nom</label>
                    <input 
                      type="text" 
                      value={last_name} 
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (form_submited) lastNameVerif(e.target.value);
                      }}
                      className={`form-control form-control-lg ${
                        form_submited && last_name_error ? "is-invalid" : ""
                      }`} 
                      placeholder="Dupont"
                      disabled={loading}
                    />
                    {form_submited && last_name_error && (
                      <div className="invalid-feedback">{last_name_error}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Prénom</label>
                    <input 
                      type="text" 
                      value={first_name} 
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (form_submited) firstNameVerif(e.target.value);
                      }}
                      className={`form-control form-control-lg ${
                        form_submited && first_name_error ? "is-invalid" : ""
                      }`} 
                      placeholder="Jean"
                      disabled={loading}
                    />
                    {form_submited && first_name_error && (
                      <div className="invalid-feedback">{first_name_error}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Adresse mail</label>
                  <input 
                    type="email" 
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
                      value={password} 
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (form_submited) passwordVerif(e.target.value);
                      }}
                      className={`form-control form-control-lg ${
                        form_submited && password_error ? "is-invalid" : ""
                      }`} 
                      placeholder="Minimum 8 caractères"
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
                    8+ caractères, majuscule, minuscule, chiffre et caractère spécial
                  </small>
                </div>

                <div className="d-grid mb-4">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn btn-primary btn-lg"
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner /> Création...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>Créer un compte
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="mb-0 text-body-secondary">
                    Vous avez déjà un compte?{" "}
                    <a href="/login" className="text-primary fw-semibold text-decoration-none">
                      Se connecter
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
};

export default Register;
