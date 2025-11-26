import React, { useState, useEffect } from 'react';
import httpClient from '../components/httpClient';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await httpClient.get(`/admin/activity-logs?page=${pageNum}&per_page=50`);
      setLogs(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalLogs(response.data.pagination.total);
      setPage(pageNum);
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Erreur lors du chargement des logs', 
        type: 'danger' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeClass = (action) => {
    if (action.includes('Connexion')) return 'bg-success';
    if (action.includes('Déconnexion')) return 'bg-secondary';
    if (action.includes('Inscription')) return 'bg-info';
    if (action.includes('Création')) return 'bg-primary';
    if (action.includes('Modification')) return 'bg-warning';
    if (action.includes('Suppression')) return 'bg-danger';
    return 'bg-secondary';
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner text="Chargement des logs d'activité..." />;
  }

  return (
    <div className="container-fluid">
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Logs d'activité</h2>
        <span className="badge bg-secondary">{totalLogs} activité{totalLogs > 1 ? 's' : ''}</span>
      </div>

      {logs.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Aucune activité enregistrée
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date/Heure</th>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Détails</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="text-nowrap">
                          <small>{formatDate(log.timestamp)}</small>
                        </td>
                        <td>
                          <div>
                            <strong>{log.user_name}</strong>
                          </div>
                          <small className="text-muted">{log.user_email}</small>
                        </td>
                        <td>
                          <span className={`badge ${getActionBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{log.details || '-'}</small>
                        </td>
                        <td>
                          <small className="font-monospace">{log.ip_address || '-'}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => fetchLogs(page - 1)}
                      disabled={page === 1 || loading}
                    >
                      Précédent
                    </button>
                  </li>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }
                    
                    return (
                      <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => fetchLogs(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => fetchLogs(page + 1)}
                      disabled={page === totalPages || loading}
                    >
                      Suivant
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ActivityLogs;
