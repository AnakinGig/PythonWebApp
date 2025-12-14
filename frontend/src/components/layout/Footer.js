import React from "react";
import BrandingConfig from "../../config/branding";


function Footer() {
  return (
    <footer className="bg-body-tertiary mt-auto py-3 border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-body-secondary">
              © {BrandingConfig.REACT_APP_COPYRIGHT_YEAR} {BrandingConfig.copyrightHolder}. Tous droits réservés.
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
