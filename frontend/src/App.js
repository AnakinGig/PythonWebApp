import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import httpClient from "./utils/httpClient";
import Cookies from 'js-cookie';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import CookieConsent from './components/common/CookieConsent';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';

// Component imports
const Footer = lazy(() => import('./components/layout/Footer'));
const PrivateRoute = lazy(() => import ('./components/common/PrivateRoute'));

// Page imports
const Home = lazy(() => import ('./pages/Home'));
const Login = lazy(() => import ('./pages/Login'));
const Register = lazy(() => import ('./pages/Register'));
const NotFound = lazy(() => import ('./pages/NotFound'));
const AdminDashboard = lazy(() => import ('./pages/AdminDashboard'));
const UsersList = lazy(() => import ('./pages/UsersList'));
const ManageUser = lazy(() => import ('./pages/ManageUser'));
const ActivityLogs = lazy(() => import ('./pages/ActivityLogs'));
const ForgotPassword = lazy(() => import ('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import ('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import ('./pages/VerifyEmail'));
const UserProfile = lazy(() => import ('./pages/UserProfile'));

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

        // Only check current user if localStorage indicates potential login
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
          try {
            const userResponse = await httpClient.get(`${process.env.REACT_APP_BACKEND_URL}/auth/current-user`);
            if (isMounted) setUser(userResponse.data.data);
          } catch (userError) {
            // Session expired or invalid, clear the flag
            localStorage.removeItem('isLoggedIn');
            if (isMounted) setUser(null);
          }
        } else {
          // No login flag, user is not logged in
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
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
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/reset-password/:token" element={<ResetPassword/>}/>
                <Route path="/verify-email/:token" element={<VerifyEmail user={user}/>}/>
                <Route path="/profile" element={
                  <PrivateRoute user={user} requiredRole={null}>
                    <UserProfile user={user} setUser={setUser}/>
                  </PrivateRoute>
                }/>
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
            <CookieConsent />
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

export { App };
export default AppWrapper;
