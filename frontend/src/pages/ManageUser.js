import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import httpClient from "../components/httpClient";
import Toast from "../components/Toast";
import { ButtonSpinner } from "../components/LoadingSpinner";
import useApi from "../components/useApi";

function ManageUser() {
  const user_id = useParams();
  const navigate = useNavigate();
  const { loading, error, callApi } = useApi();
  const [toast, setToast] = useState(null);

  const [user, setUser] = useState();

  const [new_first_name, setNewFirstName] = useState(null);
  const [new_last_name, setNewLastName] = useState(null);
  const [new_email, setNewEmail] = useState(null);
  const [new_password, setNewPassword] = useState(null);
  const [new_role, setNewRole] = useState(null);

  const [form_submited, setFormSubmited] = useState(false);
  const [first_name_error, setFirstNameError] = useState("");
  const [last_name_error, setLastNameError] = useState("");
  const [email_error, setEmailError] = useState("");
  const [password_error, setPasswordError] = useState("");

  // Set modal to modify or delete mode
  const [MODIFY, setMODIFY] = useState(false);
  const [DELETE, setDELETE] = useState(false);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Format d'email invalide");
      return false;
    }
    setEmailError("");
    return true;
  };

  const passwordVerif = (value) => {
    if (value) {
      // Only check password if it's provided
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(value)) {
        setPasswordError(
          "Le mot de passe doit contenir au moins 8 caractères et doit inclure une majuscule, une minuscule, un chiffre et un caractère spécial."
        );
        return false;
      }
    }
    setPasswordError("");
    return true;
  };

  // ### Modify account ###
  const modify_account = async (e) => {
    e.preventDefault();
    setFormSubmited(true);

    const isFirstNameValid = firstNameVerif(new_first_name);
    const isLastNameValid = lastNameVerif(new_last_name);
    const isEmailValid = emailVerif(new_email);
    const isPasswordValid = passwordVerif(new_password);

    const isFormValid =
      isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid;
    if (isFormValid) {
      const payload = {
        first_name: new_first_name ?? user.first_name,
        last_name: new_last_name ?? user.last_name,
        email: new_email ?? user.email,
        role: new_role ?? user.role,
        password: new_password || ""
      };

      const result = await callApi(() =>
        httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/admin/modify-user/${user_id.id}`, payload, {
          headers: {"Content-Type": "application/json"},
        })
      );

      if (result) {
        setToast({ message: 'Utilisateur modifié avec succès', type: 'success' });
        setTimeout(() => navigate("/admin/dashboard"), 1500);
      } else if (error) {
        const errorMsg = error.response?.data?.error || "Une erreur est survenue.";
        setToast({ message: errorMsg, type: 'error' });
        if (errorMsg.includes("dernier compte administrateur") || errorMsg.includes("propre rôle")) {
          setTimeout(() => navigate("/admin/dashboard"), 2000);
        }
      }
    }
  };

  // ### Delete account ###
  const delete_account = async () => {
    setFormSubmited(true);
    const result = await callApi(() =>
      httpClient.post(`${process.env.REACT_APP_BACKEND_URL}/admin/delete-user/${user_id.id}`)
    );

    if (result) {
      setToast({ message: 'Utilisateur supprimé avec succès', type: 'success' });
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } else if (error) {
      const errorMsg = error.response?.data?.error || "Une erreur est survenue.";
      setToast({ message: errorMsg, type: 'error' });
      if (errorMsg.includes("propre compte") || errorMsg.includes("dernier compte")) {
        setTimeout(() => navigate("/admin/dashboard"), 2000);
      }
    }
  };

  // ### Handle modal close ###
  const handle_close = async () => {
    setDELETE(false);
    setMODIFY(false);
  };

  // ### Fetch user info on page load ###
  useEffect(() => {
    const fetchUser = async () => {
      const result = await callApi(() =>
        httpClient.get(`${process.env.REACT_APP_BACKEND_URL}/admin/user-info/${user_id.id}`)
      );

      if (result) {
        setUser(result);
      } else if (error) {
        const errorMsg = error.response?.data?.error || "Une erreur est survenue.";
        setToast({ message: errorMsg, type: 'error' });
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_id.id]);

  // ### Pre-fill form with current user info ###
  useEffect(() => {
    if (user) {
      setNewFirstName(user.first_name);
      setNewLastName(user.last_name);
      setNewEmail(user.email);
      setNewRole(user.role);
    }
  }, [user]);

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {user !== undefined ? (
        <div className="">
          <h1>Modifier les informations de {user.first_name} {user.last_name}</h1>
          <form className="row mt-4">
            <div className="form-outline col-4">
              <input type="text" id="nom" value={new_last_name}
                onChange={(e) => {
                  setNewLastName(e.target.value);
                  lastNameVerif(e.target.value);
                }}
                className={`form-control form-control-lg ${last_name_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer un nouveau nom."
              />
              <label className="form-label">Nom</label>
              <div className="invalid-feedback">{last_name_error}</div>
            </div>
            <div className="form-outline col-4">
              <input type="text" id="prénom" value={new_first_name} onChange={(e) => {setNewFirstName(e.target.value);firstNameVerif(e.target.value);}}
                className={`form-control form-control-lg ${first_name_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer un nouveau prénom."
              />
              <label className="form-label">Prénom</label>
              <div className="invalid-feedback">{first_name_error}</div>
            </div>
            <div className="form-outline col-4">
              <select className="form-select form-select-lg" value={new_role} onChange={(e) => setNewRole(e.target.value)}>
                <option value="Utilisateur">Utilisateur</option>
                <option value="Administrateur">Administrateur</option>
              </select>
              <label className="form-label">Rôle</label>
            </div>
            <div className="form-outline mb-4">
              <input type="email" id="email" value={new_email}onChange={(e) => {setNewEmail(e.target.value);emailVerif(e.target.value);}}
                className={`form-control form-control-lg ${email_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer une nouvelle adresse  mail."
              />
              <label className="form-label">Adresse mail</label>
              <div className="invalid-feedback">{email_error}</div>
            </div>

            <div className="form-outline mb-3">
              <input type="password" id="password" value={new_password} onChange={(e) => {setNewPassword(e.target.value);passwordVerif(e.target.value);}}
                className={`form-control form-control-lg ${password_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer un nouveau mot de passe."
              />
              <label className="form-label">Mot de passe</label>
              <div className="invalid-feedback">{password_error}</div>
            </div>

            <div className="text-center text-lg-start mt-4 pt-2">
              <div className="d-flex justify-content-between">
                <button type="button" onClick={(e) => setMODIFY(true)} data-bs-toggle="modal" data-bs-target="#popup" className="btn btn-primary btn-lg">Modifier le compte</button>
                <button type="button" onClick={(e) => setDELETE(true)} data-bs-toggle="modal" data-bs-target="#popup" className="btn btn-danger btn-lg"> Supprimer le compte</button>
              </div>
              <div className="modal fade" id="popup" tabIndex="-1">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="popupLabel">Attention !</h1>
                    </div>
                    <div className="modal-body">
                      {MODIFY === true
                        ? "Êtes vous sur de vouloir modifier le compte de " + user.first_name + " " + user.last_name + " ?"
                        : DELETE === true
                        ? "Êtes vous sur de vouloir supprimer le compte de " + user.first_name + " " + user.last_name + " ?"
                        : ""}
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                      {MODIFY === true ? (
                        <div>
                          <button type="button" className="btn btn-primary" disabled={loading} data-bs-dismiss="modal" onClick={modify_account}>
                            {loading ? <ButtonSpinner /> : "Oui"}
                          </button>
                          <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handle_close}>Non</button>
                        </div>
                      ) : DELETE === true ? (
                        <div>
                          <button type="button" className="btn btn-primary" disabled={loading} data-bs-dismiss="modal" onClick={delete_account}>
                            {loading ? <ButtonSpinner /> : "Oui"}
                          </button>
                          <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handle_close}>Non</button>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div>Chargement...</div>
      )}
    </div>
  );
}

export default ManageUser;
