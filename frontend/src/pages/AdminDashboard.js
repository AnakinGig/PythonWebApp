import { useEffect, useState } from "react";
import httpClient from "../utils/httpClient";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Toast from "../components/common/Toast";

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [endpointFilter, setEndpointFilter] = useState("");

  const fetchData = async () => {
    try {
      const [metricsRes, healthRes, usersRes] = await Promise.all([
        httpClient.get('/metrics'),
        httpClient.get('/health'),
        httpClient.get('/admin/users?page=1&per_page=1000')
      ]);
      
      setMetrics(metricsRes.data);
      setHealth(healthRes.data);
      
      // Calculate user statistics
      const users = usersRes.data.data;
      const totalUsers = users.length;
      const adminUsers = users.filter(u => u.role === 'Administrateur').length;
      const regularUsers = users.filter(u => u.role === 'Utilisateur').length;
      
      setUserStats({
        total: totalUsers,
        admins: adminUsers,
        users: regularUsers
      });
      
      setLoading(false);
    } catch (error) {
      setToast({ message: "Erreur lors du chargement des métriques", type: 'error' });
      setLoading(false);
    }
  };

  // Export metrics to JSON
  const exportMetricsJSON = () => {
    if (!metrics) return;
    
    const data = {
      timestamp: new Date().toISOString(),
      health: health,
      metrics: metrics.application,
      system: metrics.system
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `metrics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Filter endpoints based on search
  const filteredEndpoints = metrics ? 
    Object.entries(metrics.application.endpoints).filter(([endpoint]) => 
      endpoint.toLowerCase().includes(endpointFilter.toLowerCase())
    ) : [];

  useEffect(() => {
    fetchData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading) return <LoadingSpinner text="Chargement des métriques..." />;

  const getStatusBadge = (status) => {
    return status === 'healthy' ? 
      <span className="badge bg-success">En ligne</span> : 
      <span className="badge bg-danger">Hors ligne</span>;
  };

  const getPercentBadge = (percent) => {
    if (percent < 50) return 'bg-success';
    if (percent < 80) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tableau de Bord</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-success" onClick={exportMetricsJSON} disabled={!metrics}>
            Exporter les métriques
          </button>
          <div className="form-check form-switch mb-0">
            <input 
              className="form-check-input" 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              id="autoRefreshSwitch"
            />
            <label className="form-check-label" htmlFor="autoRefreshSwitch">
              Auto-refresh (5s)
            </label>
          </div>
        </div>
      </div>

      {/* User Statistics Cards */}
      {userStats && (
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h6 className="card-subtitle mb-2 text-white-50">Total Utilisateurs</h6>
                <h2 className="card-title mb-0">{userStats.total}</h2>
                <p className="card-text mt-2">
                  <small>Utilisateurs enregistrés</small>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-danger text-white">
              <div className="card-body text-center">
                <h6 className="card-subtitle mb-2 text-white-50">Administrateurs</h6>
                <h2 className="card-title mb-0">{userStats.admins}</h2>
                <p className="card-text mt-2">
                  <small>{((userStats.admins / userStats.total) * 100).toFixed(1)}% du total</small>
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h6 className="card-subtitle mb-2 text-white-50">Utilisateurs</h6>
                <h2 className="card-title mb-0">{userStats.users}</h2>
                <p className="card-text mt-2">
                  <small>{((userStats.users / userStats.total) * 100).toFixed(1)}% du total</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Status */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">État du Système</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="text-center">
                <h6 className="text-muted">Statut</h6>
                {health && getStatusBadge(health.status)}
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h6 className="text-muted">Base de données</h6>
                <span className="badge bg-success">{health?.database}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h6 className="text-muted">Redis</h6>
                <span className="badge bg-success">{health?.redis}</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h6 className="text-muted">Uptime</h6>
                <span className="badge bg-info">{health?.uptime?.formatted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Metrics */}
      {metrics && (
        <>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted">Total Requêtes</h6>
                  <h2 className="text-primary">{metrics.application.requests.total}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted">Erreurs</h6>
                  <h2 className="text-danger">{metrics.application.requests.errors}</h2>
                  <small className="text-muted">
                    Taux d'erreur: {metrics.application.requests.error_rate}%
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted">Temps de Réponse Moyen</h6>
                  <h2 className="text-success">{metrics.application.performance.avg_response_time_ms}ms</h2>
                  <small className="text-muted">
                    Min: {metrics.application.performance.min_response_time_ms}ms | 
                    Max: {metrics.application.performance.max_response_time_ms}ms
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* System Resources */}
          {metrics.system && Object.keys(metrics.system).length > 0 && (
            <div className="card mb-4">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">Ressources Système</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <h6>CPU</h6>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar ${getPercentBadge(metrics.system.cpu?.percent || 0)}`}
                        role="progressbar" 
                        style={{width: `${metrics.system.cpu?.percent || 0}%`}}
                      >
                        {metrics.system.cpu?.percent || 0}%
                      </div>
                    </div>
                    <small className="text-muted">Cœurs: {metrics.system.cpu?.count}</small>
                  </div>
                  <div className="col-md-4">
                    <h6>Mémoire</h6>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar ${getPercentBadge(metrics.system.memory?.percent || 0)}`}
                        role="progressbar" 
                        style={{width: `${metrics.system.memory?.percent || 0}%`}}
                      >
                        {metrics.system.memory?.percent || 0}%
                      </div>
                    </div>
                    <small className="text-muted">
                      Utilisée: {metrics.system.memory?.used_mb} MB / {metrics.system.memory?.total_mb} MB
                    </small>
                  </div>
                  <div className="col-md-4">
                    <h6>Disque</h6>
                    <div className="progress mb-2">
                      <div 
                        className={`progress-bar ${getPercentBadge(metrics.system.disk?.percent || 0)}`}
                        role="progressbar" 
                        style={{width: `${metrics.system.disk?.percent || 0}%`}}
                      >
                        {metrics.system.disk?.percent || 0}%
                      </div>
                    </div>
                    <small className="text-muted">
                      Libre: {metrics.system.disk?.free_gb} GB / {metrics.system.disk?.total_gb} GB
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Endpoint Metrics */}
          <div className="card">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Métriques par Endpoint</h5>
              <span className="badge bg-light text-dark">{filteredEndpoints.length} endpoint{filteredEndpoints.length > 1 ? 's' : ''}</span>
            </div>
            <div className="card-body">
              {/* Search Filter */}
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search">🔍</i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher un endpoint..."
                    value={endpointFilter}
                    onChange={(e) => setEndpointFilter(e.target.value)}
                  />
                  {endpointFilter && (
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => setEndpointFilter("")}>
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Endpoint</th>
                      <th className="text-center">Requêtes</th>
                      <th className="text-center">Erreurs</th>
                      <th className="text-center">Temps Moyen</th>
                      <th className="text-center">Temps Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEndpoints.length > 0 ? (
                      filteredEndpoints.map(([endpoint, data]) => (
                        <tr key={endpoint}>
                          <td><code className="text-primary">{endpoint}</code></td>
                          <td className="text-center">
                            <span className="badge bg-secondary">{data.count}</span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${data.errors > 0 ? 'bg-danger' : 'bg-success'}`}>
                              {data.errors}
                            </span>
                          </td>
                          <td className="text-center">{data.avg_time.toFixed(2)} ms</td>
                          <td className="text-center text-muted">{data.total_time.toFixed(2)} ms</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          <i>Aucun endpoint trouvé</i>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
