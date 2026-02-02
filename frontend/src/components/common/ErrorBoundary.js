import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Oups ! Une erreur est survenue</h4>
            <p>
              Quelque chose s'est mal passé. Nous avons enregistré l'erreur et 
              notre équipe travaille à la résoudre.
            </p>
            <hr />
            <div className="d-flex justify-content-between">
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.href = '/'}
              >
                Retour à l'accueil
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => window.location.reload()}
              >
                Recharger la page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-3">
                <summary style={{ cursor: 'pointer' }}>Détails de l'erreur (dev only)</summary>
                <pre className="mt-2 p-3 bg-light border rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
