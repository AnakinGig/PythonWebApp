import { useEffect, useState } from "react";
import httpClient from "../httpClient";

function Home() {

    const [user, setUser] = useState()

    const getUserInfo = async () => {
        try{
            const resp = await httpClient.post("//localhost:5000/@me")
            setUser(resp.data)
        } 
        catch (e){
            console.log(e)
        } 
    }

    useEffect( () => {
        getUserInfo()
    },[])

    return (
        <div>
        <h1>Application test - React Flask</h1><br/>
        {user == null ? (
            <div>
                <p>Vous n'êtes pas connecter.</p>
            </div>
        ) : (
            <div className="d-flex flex-column">
                <h2>Bonjour {user.first_name} {user.last_name}.</h2><br></br>
                <h4>Id: {user.id}</h4>
                <h4>Email: {user.email}</h4>
                <h4>Role: {user.role}</h4><br></br>
            </div>
        )}
        </div>
    );
}

export default Home;
