import { useState, useEffect, useRef } from "react";
import httpClient from "../utils/httpClient";
import Toast from "../components/common/Toast";
import LoadingSpinner, { ButtonSpinner } from "../components/common/LoadingSpinner";
import useApi from "../hooks/useApi";

function UserProfile({ user, setUser }) {
  const { loading, callApi } = useApi();
  const [toast, setToast] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [avatar, setAvatar] = useState(null);
  
  // Store initial values to detect changes
  const [initialFirstName, setInitialFirstName] = useState("");
  const [initialLastName, setInitialLastName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  
  // Avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form_submited, setFormSubmited] = useState(false);
  const [firstName_error, setFirstNameError] = useState("");
  const [lastName_error, setLastNameError] = useState("");
  const [currentPassword_error, setCurrentPasswordError] = useState("");
  const [newPassword_error, setNewPasswordError] = useState("");
  const [confirmPassword_error, setConfirmPasswordError] = useState("");

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await httpClient.get('/user/profile');
      if (response.data.success) {
        const userData = response.data.data;
        setFirstName(userData.first_name || "");
        setLastName(userData.last_name || "");
        setEmail(userData.email || "");
        setEmailVerified(userData.email_verified === true);
        setAvatar(userData.avatar || null);
        
        // Store initial values
        setInitialFirstName(userData.first_name || "");
        setInitialLastName(userData.last_name || "");
        setInitialEmail(userData.email || "");
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || "Erreur lors du chargement du profil.", 
        type: 'error' 
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Validation functions
  const firstNameVerif = (value) => {
    if (value === "") {
      setFirstNameError("Le prénom est requis");
      return false;
    }
    setFirstNameError("");
    return true;
  };

  const lastNameVerif = (value) => {
    if (value === "") {
      setLastNameError("Le nom est requis");
      return false;
    }
    setLastNameError("");
    return true;
  };

  const currentPasswordVerif = (value) => {
    if (showPasswordSection && value === "") {
      setCurrentPasswordError("Le mot de passe actuel est requis");
      return false;
    }
    setCurrentPasswordError("");
    return true;
  };

  const newPasswordVerif = (value) => {
    if (showPasswordSection) {
      if (value === "") {
        setNewPasswordError("Le nouveau mot de passe est requis");
        return false;
      }
      if (value.length < 8) {
        setNewPasswordError("Le mot de passe doit contenir au moins 8 caractères");
        return false;
      }
      if (!/[A-Z]/.test(value)) {
        setNewPasswordError("Le mot de passe doit contenir au moins une majuscule");
        return false;
      }
      if (!/[a-z]/.test(value)) {
        setNewPasswordError("Le mot de passe doit contenir au moins une minuscule");
        return false;
      }
      if (!/[0-9]/.test(value)) {
        setNewPasswordError("Le mot de passe doit contenir au moins un chiffre");
        return false;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        setNewPasswordError("Le mot de passe doit contenir au moins un caractère spécial");
        return false;
      }
    }
    setNewPasswordError("");
    return true;
  };

  const confirmPasswordVerif = (value) => {
    if (showPasswordSection) {
      if (value === "") {
        setConfirmPasswordError("Veuillez confirmer le mot de passe");
        return false;
      }
      if (value !== newPassword) {
        setConfirmPasswordError("Les mots de passe ne correspondent pas");
        return false;
      }
    }
    setConfirmPasswordError("");
    return true;
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmited(true);

    const isFirstNameValid = firstNameVerif(firstName);
    const isLastNameValid = lastNameVerif(lastName);
    
    let isPasswordValid = true;
    if (showPasswordSection) {
      const isCurrentPasswordValid = currentPasswordVerif(currentPassword);
      const isNewPasswordValid = newPasswordVerif(newPassword);
      const isConfirmPasswordValid = confirmPasswordVerif(confirmPassword);
      isPasswordValid = isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid;
    }

    const isFormValid = isFirstNameValid && isLastNameValid && isPasswordValid;

    if (isFormValid) {
      // Check if anything has changed
      const hasProfileChanges = firstName !== initialFirstName || 
                                lastName !== initialLastName || 
                                (emailVerified && email !== initialEmail);
      const hasPasswordChanges = showPasswordSection && newPassword;
      
      if (!hasProfileChanges && !hasPasswordChanges) {
        setToast({ 
          message: "Aucune modification détectée.", 
          type: 'info' 
        });
        return;
      }
      
      const updateData = {
        first_name: firstName,
        last_name: lastName,
      };
      
      // Add email to update if it has changed and email is verified
      if (emailVerified && email !== initialEmail) {
        updateData.email = email;
      }

      if (showPasswordSection && newPassword) {
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
      }

      const { data: result, error: apiError } = await callApi(() =>
        httpClient.put('/user/profile', updateData)
      );

      if (result) {
        setToast({ 
          message: "Profil mis à jour avec succès !", 
          type: 'success' 
        });
        
        // Update user context
        if (setUser) {
          setUser(result);
        }
        
        // Update email verification status based on response
        setEmailVerified(result.email_verified || false);
        
        // Update initial values to new values
        setInitialFirstName(firstName);
        setInitialLastName(lastName);
        if (result.email_verified) {
          setInitialEmail(result.email);
        } else {
          setInitialEmail(email); // Store the new email if it needs verification
          setEmail(result.email); // Sync state with response
        }
        
        // Reset password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordSection(false);
        setFormSubmited(false);
      } else {
        if (apiError === "Le mot de passe actuel est incorrect.") {
          setCurrentPasswordError(apiError);
        }
        setToast({ message: apiError || "Une erreur est survenue.", type: 'error' });
      }
    }
  };

  // Avatar upload handlers
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: "L'image est trop volumineuse. Maximum 5MB.", type: 'error' });
        return;
      }

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setToast({ message: "Format non supporté. Utilisez PNG, JPG, GIF ou WEBP.", type: 'error' });
        return;
      }

      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await httpClient.post(
        `${process.env.REACT_APP_BACKEND_URL}/user/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setAvatar(response.data.data.avatar);
        setAvatarFile(null);
        setAvatarPreview(null);
        setToast({ message: "Avatar mis à jour avec succès", type: 'success' });
        
        // Update user context if needed
        if (setUser) {
          setUser(prev => ({ ...prev, avatar: response.data.data.avatar }));
        }
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || "Erreur lors de l'upload de l'avatar", 
        type: 'error' 
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!avatar) return;

    setUploadingAvatar(true);
    try {
      const response = await httpClient.delete(
        `${process.env.REACT_APP_BACKEND_URL}/user/avatar`
      );

      if (response.data.success) {
        setAvatar(null);
        setAvatarPreview(null);
        setToast({ message: "Avatar supprimé avec succès", type: 'success' });
        
        // Update user context if needed
        if (setUser) {
          setUser(prev => ({ ...prev, avatar: null }));
        }
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || "Erreur lors de la suppression de l'avatar", 
        type: 'error' 
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loadingProfile) {
    return (
      <div className="container py-5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <div className="d-flex align-items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="position-relative">
                    {avatarPreview || avatar ? (
                      <img 
                        src={avatarPreview || `${process.env.REACT_APP_BACKEND_URL.replace('/api', '')}/uploads/${avatar}`}
                        alt="Avatar"
                        className="rounded-circle"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                        <i className="bi bi-person-fill"></i>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="d-none"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0"
                      style={{ width: '30px', height: '30px', padding: '0' }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      title="Changer l'avatar"
                    >
                      <i className="bi bi-camera-fill"></i>
                    </button>
                  </div>
                </div>
                <div className="flex-grow-1 ms-4">
                  <h2 className="mb-1">Mon Profil</h2>
                  <p className="text-muted mb-0">
                    <i className="bi bi-envelope me-2"></i>{email}
                    {emailVerified ? (
                      <span className="badge bg-success ms-2">
                        <i className="bi bi-check-circle me-1"></i>Vérifié
                      </span>
                    ) : (
                      <span className="badge bg-warning text-dark ms-2">
                        <i className="bi bi-exclamation-circle me-1"></i>Non vérifié
                      </span>
                    )}
                  </p>
                  {avatarPreview && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-success me-2"
                        onClick={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? <ButtonSpinner /> : <i className="bi bi-check me-1"></i>}
                        Confirmer
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={cancelAvatarPreview}
                        disabled={uploadingAvatar}
                      >
                        <i className="bi bi-x me-1"></i>
                        Annuler
                      </button>
                    </div>
                  )}
                  {avatar && !avatarPreview && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleAvatarDelete}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? <ButtonSpinner /> : <i className="bi bi-trash me-1"></i>}
                        Supprimer l'avatar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <hr className="my-4" />

              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <h5 className="mb-3">
                  <i className="bi bi-person-vcard me-2"></i>Informations personnelles
                </h5>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label fw-semibold">
                      Prénom
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        form_submited && firstName_error ? "is-invalid" : ""
                      }`}
                      id="firstName"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (form_submited) firstNameVerif(e.target.value);
                      }}
                      disabled={loading}
                    />
                    {form_submited && firstName_error && (
                      <div className="invalid-feedback">{firstName_error}</div>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label fw-semibold">
                      Nom
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        form_submited && lastName_error ? "is-invalid" : ""
                      }`}
                      id="lastName"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (form_submited) lastNameVerif(e.target.value);
                      }}
                      disabled={loading}
                    />
                    {form_submited && lastName_error && (
                      <div className="invalid-feedback">{lastName_error}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!emailVerified || loading}
                  />
                  <small className="text-muted">
                    {emailVerified 
                      ? "" 
                      : "L'email ne peut être modifié que s'il est vérifié"}
                  </small>
                </div>

                <hr className="my-4" />

                {/* Change Password Section */}
                <div className="mb-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                  >
                    <i className={`bi bi-${showPasswordSection ? 'x' : 'key'} me-2`}></i>
                    {showPasswordSection ? 'Annuler' : 'Changer le mot de passe'}
                  </button>
                </div>

                {showPasswordSection && (
                  <>
                    <h5 className="mb-3">
                      <i className="bi bi-shield-lock me-2"></i>Changer le mot de passe
                    </h5>

                    {/* Current Password */}
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label fw-semibold">
                        Mot de passe actuel
                      </label>
                      <div className="input-group">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className={`form-control ${
                            form_submited && currentPassword_error ? "is-invalid" : ""
                          }`}
                          id="currentPassword"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (form_submited) currentPasswordVerif(e.target.value);
                          }}
                          disabled={loading}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={loading}
                        >
                          <i className={`bi bi-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                        </button>
                        {form_submited && currentPassword_error && (
                          <div className="invalid-feedback">{currentPassword_error}</div>
                        )}
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label fw-semibold">
                        Nouveau mot de passe
                      </label>
                      <div className="input-group">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className={`form-control ${
                            form_submited && newPassword_error ? "is-invalid" : ""
                          }`}
                          id="newPassword"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (form_submited) {
                              newPasswordVerif(e.target.value);
                              if (confirmPassword) confirmPasswordVerif(confirmPassword);
                            }
                          }}
                          disabled={loading}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={loading}
                        >
                          <i className={`bi bi-eye${showNewPassword ? '-slash' : ''}`}></i>
                        </button>
                        {form_submited && newPassword_error && (
                          <div className="invalid-feedback">{newPassword_error}</div>
                        )}
                      </div>
                      <small className="text-muted">
                        8+ caractères, majuscule, minuscule, chiffre, caractère spécial
                      </small>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold">
                        Confirmer le mot de passe
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control ${
                            form_submited && confirmPassword_error ? "is-invalid" : ""
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
                        {form_submited && confirmPassword_error && (
                          <div className="invalid-feedback">{confirmPassword_error}</div>
                        )}
                      </div>
                    </div>

                    <hr className="my-4" />
                  </>
                )}

                {/* Submit Button */}
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ButtonSpinner /> Mise à jour...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
