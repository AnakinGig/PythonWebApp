import { useParams } from "react-router";
import { use, useEffect, useState } from "react";
import httpClient from "../httpClient";
import axios from "axios";

function ManageUser() {
    const user_id = useParams();

    const [user, setUser] = useState()

    const [newFirstName, setNewFirstName] = useState(null)
    const [newLastName, setNewLastName] = useState(null)
    const [newEmail, setNewEmail] = useState(null)
    const [newPassword, setNewPassword] = useState(null)
    const [newRole, setNewRole] = useState(null)

    const [MODIFY, setMODIFY] = useState(false)
    const [DELETE, setDELETE] = useState(false)

    const modify_account = async () => {
        const payload = {
            first_name: newFirstName ?? user.first_name,
            last_name: newLastName ?? user.last_name,
            email: newEmail ?? user.email,
            role: newRole ?? user.role,
        }

        if (newPassword){
            payload.password = newPassword;
        }

        httpClient.post("//localhost:5000/modify-user/"+user_id.id, {
            
        })
        .then(resp =>{
            window.location.href ="/admin/dashboard"
            console.log(resp.data)
        })
        .catch(error => console.error(error));
    }

    const delete_account = async () => {
        
    }

    const handle_close = async () => {
        setDELETE(false)
        setMODIFY(false)
    }

    useEffect(() => {
        httpClient.post("//localhost:5000/user-info/"+user_id.id)
            .then(res => {
                setUser(res.data);
                console.log('1')
            })
            .catch(err => console.error(err));
    },[]);

    useEffect(() => {
        if(user){
            setNewFirstName(user.first_name)
            setNewLastName(user.last_name)
            setNewEmail(user.email)
            setNewRole(user.role)
        }
    },[user]);

  return (
    <div>
        {user != undefined ? (
            <div className="">
                <h1>Modifier les informations de {user.first_name} {user.last_name}</h1>
                <form className="row mt-4">
                    <div className="form-outline col-4">
                        <input type="text" id="nom" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className="form-control form-control-lg" placeholder="Entrer un nouveau nom." />
                        <label className="form-label">Nom</label>
                    </div>
                    <div className="form-outline col-4">
                        <input type="text" id="prénom" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="form-control form-control-lg" placeholder="Entrer un nouveau prénom." />
                        <label className="form-label">Prénom</label>
                    </div>
                    <div className="form-outline col-4">
                        <select className="form-select form-select-lg" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                            <option value="Utilisateur">Utilisateur</option>
                            <option value="Administrateur">Administrateur</option>
                        </select>
                        <label className="form-label">Rôle</label>
                    </div>
                    <div className="form-outline mb-4">
                        <input type="email" id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="form-control form-control-lg" placeholder="Entrer une nouvelle adresse  mail." />
                        <label className="form-label">Adresse mail</label>
                    </div>

                    <div className="form-outline mb-3">
                        <input type="password" id="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-control form-control-lg" placeholder="Entrer un nouveau mot de passe." />
                        <label className="form-label">Mot de passe</label>
                    </div>

                    <div className="text-center text-lg-start mt-4 pt-2">
                        <div className="d-flex justify-content-between">
                            <button type="button" onClick={(e) => setMODIFY(true)} data-bs-toggle="modal" data-bs-target="#popup" className="btn btn-primary btn-lg">Modifier le compte</button>
                            <button type="button" onClick={(e) => setDELETE(true)} data-bs-toggle="modal" data-bs-target="#popup" className="btn btn-danger btn-lg">Supprimer le compte</button>
                        </div>
                        <div className="modal fade" id="popup" tabIndex="-1" aria-labelledby="popup" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="popupLabel">Attention !</h1>
                                    </div>
                                    <div className="modal-body">
                                        {MODIFY === true ? ('Êtes vous sur de vouloir modifier le compte de '+user.first_name+ ' ' +user.last_name+' ?' ) : 
                                        DELETE === true ? ('Êtes vous sur de vouloir supprimer le compte de '+user.first_name+ ' ' +user.last_name+' ?'):("")}
                                    </div>
                                    <div className="modal-footer d-flex justify-content-center">
                                        {MODIFY === true ? 
                                        (
                                            <div>
                                                <button type="button" className="btn btn-primary" onClick={modify_account}>Oui</button>
                                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handle_close}>Non</button>
                                            </div>
                                        ) : 
                                        DELETE === true ? 
                                        (
                                            <div>
                                                <button type="button" className="btn btn-primary" onClick={delete_account}>Oui</button>
                                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal"onClick={handle_close}>Non</button>
                                            </div>
                                        ) : 
                                        ("")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        ) : (<div>Chargement...</div>)}
    </div>
  );
}

export default ManageUser;
