import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be changed
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem('cookieConsent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs) => {
    const consentData = {
      necessary: true, // Always true
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setPreferences(consentData);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    savePreferences({ analytics: true, marketing: true });
  };

  const acceptNecessaryOnly = () => {
    savePreferences({ analytics: false, marketing: false });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  const handlePreferenceChange = (category) => {
    if (category === 'necessary') return; // Cannot change necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Expose a global function to reopen preferences (called from Footer)
  useEffect(() => {
    window.openCookiePreferences = () => {
      setShowPreferences(true);
    };
    return () => {
      delete window.openCookiePreferences;
    };
  }, []);

  if (!showBanner && !showPreferences) {
    return null;
  }

  return (
    <>
      {/* Banner for first-time visitors */}
      {showBanner && !showPreferences && (
        <div
          className="position-fixed bottom-0 start-0 end-0 bg-gradient text-white p-3 shadow-lg cookieSlideUp"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: 9999,
          }}
          role="dialog"
          aria-label="Consentement aux cookies"
        >
          <div className="container-fluid d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div>
              <h5 className="mb-2">🍪 Nous utilisons des cookies</h5>
              <p className="mb-0 small">
                Nous utilisons des cookies pour améliorer votre expérience. Les cookies nécessaires sont toujours actifs.
                Vous pouvez personnaliser vos préférences ou accepter tous les cookies.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap flex-sm-nowrap">
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => setShowPreferences(true)}
                aria-label="Personnaliser les préférences de cookies"
              >
                Personnaliser
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={acceptNecessaryOnly}
                aria-label="Accepter uniquement les cookies nécessaires"
              >
                Nécessaires
              </button>
              <button
                className="btn btn-sm btn-light"
                onClick={acceptAll}
                aria-label="Accepter tous les cookies"
              >
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          className="position-fixed top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center cookieFadeIn"
          style={{ zIndex: 10000 }}
          role="dialog"
          aria-labelledby="cookie-preferences-title"
        >
          <div
            className="position-absolute top-0 start-0 end-0 bottom-0"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowPreferences(false)}
          ></div>
          <div
            className="bg-white rounded-3 shadow-lg position-relative cookieSlideDown"
            style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
              <h5 id="cookie-preferences-title" className="mb-0">
                Préférences de cookies
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowPreferences(false)}
                aria-label="Fermer"
              ></button>
            </div>

            {/* Body */}
            <div className="p-4" style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 180px)' }}>
              <p className="text-muted mb-4 small">
                Gérez vos préférences de cookies. Les cookies nécessaires sont requis pour le bon fonctionnement du site
                et ne peuvent pas être désactivés.
              </p>

              {/* Necessary Cookies */}
              <div className="border rounded p-3 bg-light mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="cookie-necessary"
                    checked={true}
                    disabled
                    aria-label="Cookies nécessaires (toujours actifs)"
                  />
                  <label className="form-check-label fw-bold" htmlFor="cookie-necessary">
                    Cookies nécessaires{' '}
                    <span className="badge bg-success ms-2">Toujours actifs</span>
                  </label>
                </div>
                <p className="text-muted small ms-4 mt-2 mb-0">
                  Ces cookies sont essentiels pour le fonctionnement du site (authentification, sécurité, préférences).
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded p-3 bg-light mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="cookie-analytics"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    aria-label="Cookies analytiques"
                  />
                  <label className="form-check-label fw-bold" htmlFor="cookie-analytics">
                    Cookies analytiques
                  </label>
                </div>
                <p className="text-muted small ms-4 mt-2 mb-0">
                  Ces cookies nous aident à comprendre comment les visiteurs interagissent avec le site (Google
                  Analytics, statistiques).
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border rounded p-3 bg-light mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="cookie-marketing"
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    aria-label="Cookies marketing"
                  />
                  <label className="form-check-label fw-bold" htmlFor="cookie-marketing">
                    Cookies marketing
                  </label>
                </div>
                <p className="text-muted small ms-4 mt-2 mb-0">
                  Ces cookies sont utilisés pour afficher des publicités pertinentes et suivre l'efficacité des
                  campagnes.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-top p-4 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={acceptNecessaryOnly}>
                Nécessaires uniquement
              </button>
              <button className="btn btn-primary" onClick={saveCustomPreferences}>
                Enregistrer mes préférences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
