import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import httpClient from "./httpClient";
import Header from './pages/Header'

const PrivateRoute = lazy(() => import ('./PrivateRoute'));
const Home = lazy(() => import ('./pages/Home'));
const Login = lazy(() => import ('./pages/Login'));
const Register = lazy(() => import ('./pages/Register'));
const NotFound = lazy(() => import ('./pages/NotFound'));
const AdminDashboard = lazy(() => import ('./pages/AdminDashboard'));
const ManageUser = lazy(() => import ('./pages/ManageUser'));

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const fetchUser = async () => {
            try {
                const resp = await httpClient.get("//localhost:5000/@me");
                if (isMounted) setUser(resp.data);
            } catch (error) {
                console.error("Error fetching user:", error);
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        
        fetchUser();
        return () => { isMounted = false; };
    }, []);

    if (loading) return <div>Chargement...</div>;

    return (
        <div>
            <Header user={user} setUser={setUser}/>
            <div className='container mt-4'>
                <Suspense fallback={<div>Chargement...</div>}>
                    <Routes>
                        <Route path="/" element={<Home user={user}/>}/>
                        <Route path="/login" element={<Login setUser={setUser}/>}/>
                        <Route path="/register" element={<Register setUser={setUser}/>}/>
                        <Route path="/admin/dashboard" element={
                            <PrivateRoute user={user} requiredRole={'Administrateur'}>
                                <AdminDashboard setUser={setUser}/>
                            </PrivateRoute>
                        }/>
                        <Route path="/admin/manage-user/:id" element={
                            <PrivateRoute user={user} requiredRole={'Administrateur'}>
                                <ManageUser/>
                            </PrivateRoute>
                        }/>
                        <Route path="/*" element={<NotFound/>}/>
                    </Routes>
                </Suspense>
            </div>
        </div>
    );
}

const AppWrapper = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

export default AppWrapper;
