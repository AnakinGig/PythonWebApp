import { BrowserRouter, Routes, Route } from 'react-router-dom'

import PrivateRoute from './PrivateRoute';
import Home from './pages/Home'
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import ManageUser from './pages/ManageUser'

function Router({user}) {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/admin/dashboard" element={
                    <PrivateRoute user={user} requiredRole={'Administrateur'}>
                        <AdminDashboard/>
                    </PrivateRoute>
                }/>
                <Route path="/admin/manage-user/:id" element={
                    <PrivateRoute user={user} requiredRole={'Administrateur'}>
                        <ManageUser/>
                    </PrivateRoute>
                }/>
                <Route path="/*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default Router;
