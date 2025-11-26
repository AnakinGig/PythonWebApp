import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import httpClient from "./components/httpClient";
import Cookies from 'js-cookie';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeProvider } from './context/ThemeContext';

// Component imports
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));
const PrivateRoute = lazy(() => import ('./components/PrivateRoute'));

// Page imports
const Home = lazy(() => import ('./pages/Home'));
const Login = lazy(() => import ('./pages/Login'));
const Register = lazy(() => import ('./pages/Register'));
const NotFound = lazy(() => import ('./pages/NotFound'));
const AdminDashboard = lazy(() => import ('./pages/AdminDashboard'));
const UsersList = lazy(() => import ('./pages/UsersList'));
const ManageUser = lazy(() => import ('./pages/ManageUser'));
const ActivityLogs = lazy(() => import ('./pages/ActivityLogs'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCsrfAndUser = async () => {
      let isMounted = true;
      try {
        // Fetch CSRF token first
        const csrfResponse = await httpClient.get(`${process.env.REACT_APP_BACKEND_URL}/get_csrf_token`);
        const csrfToken = csrfResponse.data.csrf_token;
        Cookies.set('csrf_token', csrfToken);

        // Then fetch user
        const userResponse = await httpClient.get(`${process.env.REACT_APP_BACKEND_URL}/@me`);
        if (isMounted) setUser(userResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
      return () => { isMounted = false; };
    }
    fetchCsrfAndUser();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <LoadingSpinner size="lg" text="Chargement de l'application..." />
    </div>
  );

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <div className="d-flex flex-column min-vh-100">
          <Header user={user} setUser={setUser}/>
          <div className='container mt-4 flex-grow-1'>
            <Suspense fallback={<LoadingSpinner text="Chargement de la page..." />}>
              <Routes>
                <Route path="/" element={<Home user={user}/>}/>
                <Route path="/login" element={<Login setUser={setUser}/>}/>
                <Route path="/register" element={<Register setUser={setUser}/>}/>
                <Route path="/admin/dashboard" element={
                  <PrivateRoute user={user} requiredRole={'Administrateur'}>
                    <AdminDashboard setUser={setUser}/>
                  </PrivateRoute>
                }/>
                <Route path="/admin/users" element={
                  <PrivateRoute user={user} requiredRole={'Administrateur'}>
                    <UsersList/>
                  </PrivateRoute>
                }/>
                <Route path="/admin/manage-user/:id" element={
                  <PrivateRoute user={user} requiredRole={'Administrateur'}>
                    <ManageUser/>
                  </PrivateRoute>
                }/>
                <Route path="/admin/activity-logs" element={
                  <PrivateRoute user={user} requiredRole={'Administrateur'}>
                    <ActivityLogs/>
                  </PrivateRoute>
                }/>
                <Route path="/*" element={<NotFound/>}/>
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
