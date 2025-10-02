

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../httpClient";

function AdminDashboard() {

    const [users, setUsers] = useState()

    const navigate = useNavigate();

    const getAllUsersInfo = async () => {
        try{
            const resp = await httpClient.post("//localhost:5000/@all")
            setUsers(resp.data)
        } 
        catch (e){
            console.log(e)
        } 
    }

    useEffect( () => {
        getAllUsersInfo()
    },[])

  return (
    <div>
        <table className="table table-hover table-striped">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Nom</th>
                    <th scope="col">Prénom</th>
                    <th scope="col">Adresse mail</th>
                    <th scope="col">Rôle</th>
                </tr>
            </thead>
            <tbody>
                {users !== undefined ? (
                    users.data.map(user =>(
                        <tr key={user.id} onClick={ () => {
                            navigate({pathname: `/admin/manage-user/`+ user.id})
                        }}>
                            <td>{user.id}</td>
                            <td>{user.first_name}</td>
                            <td>{user.last_name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                        </tr>
                    ))) : (<tr><td>"Chargement..."</td></tr>)}
            </tbody>
        </table>
    </div>
  );
}

export default AdminDashboard;
