import React from "react";
import BrandingConfig from "../../config/branding";


function Footer() {
  const handleCookiePreferences = (e) => {
    e.preventDefault();
    if (window.openCookiePreferences) {
      window.openCookiePreferences();
    }
  };

  return (
    <footer className="bg-body-tertiary mt-auto py-3 border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-body-secondary">
              © {BrandingConfig.REACT_APP_COPYRIGHT_YEAR} {BrandingConfig.copyrightHolder}. Tous droits réservés.
            </p>
            <p className="mb-0 text-body-secondary small">
              <a href="#cookie-preferences" onClick={handleCookiePreferences} className="text-decoration-none">
                Préférences de cookies
              </a>
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="mb-0 text-body-secondary">
              Développé avec <span className="text-danger">❤</span> par <strong>Gigant Anakin</strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
