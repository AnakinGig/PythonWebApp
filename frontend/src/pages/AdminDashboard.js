

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from "../httpClient";

function AdminDashboard() {

    const [users, setUsers] = useState()
    const [newFirstName, setNewFirstName] = useState()
    const [newLastName, setNewLastName] = useState()
    const [newEmail, setNewEmail] = useState()
    const [newPassword, setNewPassword] = useState()
    const [newRole, setNewRole] = useState("Utilisateur")

    const navigate = useNavigate();

    const getAllUsersInfo = async () => {
        httpClient.post("//localhost:5000/@all")
        .then(resp => {
            setUsers(resp.data)
        })
        .catch(error => console.error(error));
    }

    const addNewUser = async () => {
        httpClient.post("//localhost:5000/add-user",{
            email: newEmail,
            first_name: newFirstName,
            last_name: newLastName,
            password: newPassword,
            role: newRole,
        })
        .then(resp =>{
            console.log(resp);
            window.location.href = "/admin/dashboard"
        })
        .catch(error => {console.error(error)});
    }

    useEffect( () => {
        getAllUsersInfo()
    },[])

  return (
    <div>
        <div>
            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#popup">+ Ajouter un nouvel utilisateur</button><br/><br/>
            <div className="modal fade" id="popup" tabIndex="-1" aria-labelledby="popup" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="popupLabel">Ajouter un nouvel utilisateur.</h1>
                        </div>
                        <div className="modal-body">
                            <form className="row mt-4">
                                <div className="form-outline col-4">
                                    <input type="text" id="nom" onChange={(e) => setNewLastName(e.target.value)} className="form-control form-control-lg" placeholder="Entrer un nouveau nom." />
                                    <label className="form-label">Nom</label>
                                </div>
                                <div className="form-outline col-4">
                                    <input type="text" id="prénom" onChange={(e) => setNewFirstName(e.target.value)} className="form-control form-control-lg" placeholder="Entrer un nouveau prénom." />
                                    <label className="form-label">Prénom</label>
                                </div>
                                <div className="form-outline col-4">
                                    <select className="form-select form-select-lg" onChange={(e) => setNewRole(e.target.value)}>
                                        <option selected value="Utilisateur">Utilisateur</option>
                                        <option value="Administrateur">Administrateur</option>
                                    </select>
                                    <label className="form-label">Rôle</label>
                                </div>
                                <div className="form-outline">
                                    <input type="email" id="email" onChange={(e) => setNewEmail(e.target.value)} className="form-control form-control-lg" placeholder="Entrer une nouvelle adresse  mail." />
                                    <label className="form-label">Adresse mail</label>
                                </div>
                                <div className="form-outline">
                                    <input type="password" id="password" onChange={(e) => setNewPassword(e.target.value)} className="form-control form-control-lg" placeholder="Entrer un nouveau mot de passe." />
                                    <label className="form-label">Mot de passe</label>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <button className="btn btn-lg btn-danger" data-bs-dismiss="modal">Annuler</button>
                            <button className="btn btn-lg btn-success" onClick={addNewUser}>Enregistrer</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
                            <td>{user.last_name}</td>
                            <td>{user.first_name}</td>
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
