import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import httpClient from "../utils/httpClient";
import Toast from "../components/common/Toast";
import ConfirmDialog from "../components/common/ConfirmDialog";
import useApi from "../hooks/useApi";

function ManageUser() {
  const user_id = useParams();
  const navigate = useNavigate();
  const { loading, callApi } = useApi();
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
  const [role_error, setRoleError] = useState("");

  // Modal action state: null | 'modify' | 'delete'
  const [modalAction, setModalAction] = useState(null);

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

      const { data: result, error: apiError } = await callApi(() =>
        httpClient.put(`${process.env.REACT_APP_BACKEND_URL}/admin/users/${user_id.id}`, payload, {
          headers: {"Content-Type": "application/json"},
        })
      );

      if (result) {
        setModalAction(null);
        setToast({ message: 'Utilisateur modifié avec succès', type: 'success' });
        setTimeout(() => navigate("/admin/dashboard"), 1500);
      } else {
        // Error occurred
        setModalAction(null);
        const errorMsg = apiError || "Une erreur est survenue.";
        setToast({ message: errorMsg, type: 'error' });
        
        // Handle admin-specific restrictions
        if (errorMsg === "Impossible de modifier le rôle du dernier compte administrateur." ||
            errorMsg === "Impossible de modifier votre propre rôle administrateur." || 
            errorMsg === "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.") {
          // Don't navigate away, let user see the error and try again
        } else {
          // For other errors, navigate back after showing error
          setTimeout(() => navigate("/admin/dashboard"), 2000);
        }
      }
    }
  };

  // ### Delete account ###
  const delete_account = async () => {
    setFormSubmited(true);
    const { data: result, error: apiError } = await callApi(() =>
      httpClient.delete(`${process.env.REACT_APP_BACKEND_URL}/admin/users/${user_id.id}`)
    );

    if (result) {
      setModalAction(null);
      setToast({ message: 'Utilisateur supprimé avec succès', type: 'success' });
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } else {
      setModalAction(null);
      const errorMsg = apiError || "Une erreur est survenue.";
      setToast({ message: errorMsg, type: 'error' });
      
      // Handle admin-specific restrictions
      if (errorMsg === "Vous ne pouvez pas supprimer votre propre compte admin." ||
          errorMsg === "Impossible de supprimer le dernier compte administrateur.") {
        // Navigate back immediately for these critical restrictions
      } else{
        setTimeout(() => navigate("/admin/dashboard"), 2000);
      }
    }
  };



  // ### Fetch user info on page load ###
  useEffect(() => {
    const fetchUser = async () => {
      const { data: result, error: apiError } = await callApi(() =>
        httpClient.get(`${process.env.REACT_APP_BACKEND_URL}/admin/users/${user_id.id}`)
      );

      if (result) {
        setUser(result.data);
      } else {
        const errorMsg = apiError || "Une erreur est survenue.";
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
              <label className="form-label">Nom</label>
              <input type="text" id="nom" value={new_last_name} onChange={(e) => {setNewLastName(e.target.value);lastNameVerif(e.target.value);}}
                className={`form-control form-control-lg ${last_name_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer un nouveau nom."
              />
              <div className="invalid-feedback">{last_name_error}</div>
            </div>
            <div className="form-outline col-4">
              <label className="form-label">Prénom</label>
              <input type="text" id="prénom" value={new_first_name} onChange={(e) => {setNewFirstName(e.target.value);firstNameVerif(e.target.value);}}
                className={`form-control form-control-lg ${first_name_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer un nouveau prénom."
              />
              <div className="invalid-feedback">{first_name_error}</div>
            </div>
            <div className="form-outline col-4">
              <label className="form-label">Rôle</label>
              <select value={new_role} onChange={(e) => setNewRole(e.target.value)}
                className={`form-control form-control-lg ${role_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} 
              >
                <option value="Utilisateur">Utilisateur</option>
                <option value="Administrateur">Administrateur</option>
              </select>
              <div className="invalid-feedback">{role_error}</div>
            </div>
            <div className="form-outline mb-4">
              <label className="form-label">Adresse mail</label>
              <input type="email" id="email" value={new_email}onChange={(e) => {setNewEmail(e.target.value);emailVerif(e.target.value);}}
                className={`form-control form-control-lg ${email_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer une nouvelle adresse  mail."
              />
              <div className="invalid-feedback">{email_error}</div>
            </div>

            <div className="form-outline mb-3">
              <label className="form-label">Mot de passe</label>
              <input type="password" id="password" value={new_password} onChange={(e) => {setNewPassword(e.target.value);passwordVerif(e.target.value);}}
                className={`form-control form-control-lg ${password_error ? "is-invalid" : form_submited ? "is-valid" : ""}`} placeholder="Entrer un nouveau mot de passe."
              />
              <div className="invalid-feedback">{password_error}</div>
            </div>

            <div className="text-center text-lg-start mt-4 pt-2">
              <div className="d-flex justify-content-between">
                <button type="button" onClick={() => setModalAction('modify')} className="btn btn-primary btn-lg">Modifier le compte</button>
                <button type="button" onClick={() => setModalAction('delete')} className="btn btn-danger btn-lg">Supprimer le compte</button>
              </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
              isOpen={modalAction !== null}
              onClose={() => setModalAction(null)}
              onConfirm={modalAction === 'modify' ? modify_account : delete_account}
              title="Attention !"
              message={
                modalAction === 'modify'
                  ? `Êtes-vous sûr de vouloir modifier le compte de ${user.first_name} ${user.last_name} ?`
                  : `Êtes-vous sûr de vouloir supprimer le compte de ${user.first_name} ${user.last_name} ?`
              }
              loading={loading}
              danger={modalAction === 'delete'}
            />
          </form>
        </div>
      ) : (
        <div>Chargement...</div>
      )}
    </div>
  );
}

export default ManageUser;
