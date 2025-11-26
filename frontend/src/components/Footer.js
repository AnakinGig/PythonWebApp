import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light mt-auto py-3 border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-muted">
              © {currentYear} PythonWebApp. Tous droits réservés.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="mb-0 text-muted">
              Développé avec <span className="text-danger">❤</span> par <strong>Artech Sécurité</strong>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
