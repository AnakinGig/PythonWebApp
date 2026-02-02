import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../utils/httpClient";
import Toast from "../components/common/Toast";
import { ButtonSpinner } from "../components/common/LoadingSpinner";
import useApi from "../hooks/useApi";
import Modal from "../components/common/Modal";
import { SkeletonTable } from "../components/common/SkeletonLoader";

function UsersList() {
  const navigate = useNavigate();
  const { loading, callApi } = useApi();

  const [users, setUsers] = useState();
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [new_first_name, setNewFirstName] = useState("");
  const [new_last_name, setNewLastName] = useState("");
  const [new_email, setNewEmail] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [new_role, setNewRole] = useState("Utilisateur");

  const [form_submited, setFormSubmited] = useState(false);
  const [first_name_error, setFirstNameError] = useState("");
  const [last_name_error, setLastNameError] = useState("");
  const [email_error, setEmailError] = useState("");
  const [password_error, setPasswordError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Filtered users based on search and role filter
  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

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

  // ### Fetch all users from the backend ###
  const getAllUsersInfo = useCallback(async (page = 1) => {
    const { data: result, error: apiError } = await callApi(() =>
      httpClient.get(`/admin/users?page=${page}&per_page=20`)
    );

    if (result) {
      setUsers(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } else {
      const errorMsg = apiError || "Une erreur est survenue.";
      setToast({ message: errorMsg, type: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ### Add a new user to the database ###
  const addNewUser = async (e) => {
    e.preventDefault();
    setFormSubmited(true);

    const isFirstNameValid = firstNameVerif(new_first_name);
    const isLastNameValid = lastNameVerif(new_last_name);
    const isEmailValid = emailVerif(new_email);
    const isPasswordValid = passwordVerif(new_password);

    const isFormValid =
      isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid;

    if (isFormValid) {
      const { data: result, error: apiError } = await callApi(() =>
        httpClient.post('/admin/users', {
          first_name: new_first_name,
          last_name: new_last_name,
          email: new_email,
          password: new_password,
          role: new_role,
        })
      );

      if (result) {
        getAllUsersInfo(currentPage);
        handleClose();
        setToast({ message: 'Utilisateur créé avec succès', type: 'success' });
      } else {
        const errorMsg = apiError || "Une erreur est survenue.";
        setToast({ message: errorMsg, type: 'error' });
      }
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    // Reset form
    setNewFirstName("");
    setNewLastName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("Utilisateur");
    setFormSubmited(false);
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
  };

  useEffect(() => {
    getAllUsersInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Export users to CSV
  const exportToCSV = () => {
    if (!users || users.length === 0) return;
    
    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Rôle'];
    const csvData = users.map(user => [
      user.id,
      user.last_name,
      user.first_name,
      user.email,
      user.role
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestion des Utilisateurs</h1>
        <div>
          <button className="btn btn-success me-2" onClick={exportToCSV} disabled={!users || users.length === 0}>
            Exporter en CSV
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Ajouter un utilisateur
          </button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text">🔍</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => setSearchTerm("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Tous les rôles</option>
                <option value="Utilisateur">Utilisateur</option>
                <option value="Administrateur">Administrateur</option>
              </select>
            </div>
          </div>
          {filteredUsers && (
            <div className="mt-2">
              <small className="text-muted">
                {filteredUsers.length} utilisateur(s) trouvé(s)
                {(searchTerm || filterRole !== "all") && ` sur ${users.length} total`}
              </small>
            </div>
          )}
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Ajouter un nouvel utilisateur"
        size="xl"
        showFooter={false}
      >
        <div>
          <form className="row">
            <div className="form-outline col-4">
              <label className="form-label">Nom</label>
              <input type="text" id="nom" value={new_last_name} onChange={(e) => {setNewLastName(e.target.value);lastNameVerif(e.target.value);}}
                className={`form-control form-control-lg ${last_name_error ? "is-invalid" : form_submited ? "is-valid": ""}`} placeholder="Entrer un nouveau nom."/>
              <div className="invalid-feedback">{last_name_error}</div>
            </div>
            <div className="form-outline col-4">
              <label className="form-label">Prénom</label>
              <input type="text" id="prénom" value={new_first_name} onChange={(e) => {setNewFirstName(e.target.value);firstNameVerif(e.target.value);}}
                className={`form-control form-control-lg ${first_name_error ? "is-invalid" : form_submited ? "is-valid" : ""}`}
                placeholder="Entrer un nouveau prénom."
              />
              <div className="invalid-feedback">{first_name_error}</div>
            </div>
            <div className="form-outline col-4">
              <label className="form-label">Rôle</label>
              <select className="form-select form-select-lg" onChange={(e) => setNewRole(e.target.value)}>
                <option value="Utilisateur">Utilisateur</option>
                <option value="Administrateur">Administrateur</option>
              </select>
            </div>
            <div className="form-outline mt-4">
              <label className="form-label">Adresse mail</label>
              <input type="email" id="email" value={new_email} onChange={(e) => {setNewEmail(e.target.value);emailVerif(e.target.value);}}
                className={`form-control form-control-lg ${email_error ? "is-invalid" : form_submited ? "is-valid" : ""}`}placeholder="Entrer une nouvelle adresse  mail."/>
              <div className="invalid-feedback">{email_error}</div>
            </div>
            <div className="form-outline mt-4">
              <label className="form-label">Mot de passe</label>
              <input type="password" id="password" value={new_password} onChange={(e) => { setNewPassword(e.target.value); passwordVerif(e.target.value);}}
                className={`form-control form-control-lg ${password_error ? "is-invalid" : form_submited ? "is-valid" : ""}`}placeholder="Entrer un nouveau mot de passe."/>
              <div className="invalid-feedback">{password_error}</div>
            </div>
          </form>
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-lg btn-danger" onClick={handleClose} disabled={loading}>Annuler</button>
            <button className="btn btn-lg btn-success" disabled={loading} onClick={addNewUser}>
              {loading ? <ButtonSpinner /> : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>

      {users === undefined ? (
        <SkeletonTable rows={10} columns={5} />
      ) : filteredUsers && filteredUsers.length > 0 ? (
        <div className="card">
          <div className="card-body">
            <table className="table table-hover table-striped mb-0">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Nom</th>
                  <th scope="col">Prénom</th>
                  <th scope="col">Adresse mail</th>
                  <th scope="col">Rôle</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} onClick={() => {
                    navigate({ pathname: `/admin/manage-user/` + user.id });
                  }} style={{ cursor: 'pointer' }}>
                    <td>{user.id}</td>
                    <td>{user.last_name}</td>
                    <td>{user.first_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'Administrateur' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">Aucun utilisateur trouvé</h5>
            <p className="text-muted">Essayez de modifier vos critères de recherche</p>
          </div>
        </div>
      )}
      
      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${!pagination.has_prev ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => getAllUsersInfo(currentPage - 1)} disabled={!pagination.has_prev}>
                Précédent
              </button>
            </li>
            {[...Array(pagination.pages)].map((_, i) => (
              <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => getAllUsersInfo(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${!pagination.has_next ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => getAllUsersInfo(currentPage + 1)} disabled={!pagination.has_next}>
                Suivant
              </button>
            </li>
          </ul>
          <p className="text-center text-muted">
            Page {pagination.page} sur {pagination.pages} ({pagination.total} utilisateurs au total)
          </p>
        </nav>
      )}
    </div>
  );
}

export default UsersList;
