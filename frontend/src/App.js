import Router from './Router'
import Header from './pages/Header'

import { useEffect, useState } from "react";
import httpClient from "./httpClient";

function App() {

    const [user, setUser] = useState(undefined); // undefined = loading // null = not logged in

    useEffect(() => {
        httpClient.get("//localhost:5000/@me")
        .then(resp => setUser(resp.data))
        .catch(() => setUser(null));
    }, []);

    if (user === undefined) return <div>Loading...</div>;

    return (
        <div>
            <Header></Header>
            <div className='container mt-4'>
                <Router user={user}></Router>
            </div>
        </div>
    );
}

export default App;
