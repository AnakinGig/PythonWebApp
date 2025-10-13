import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import httpClient from '../httpClient'
import UserContext from "../UserContext";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {user, setUser} = useContext(UserContext)

    const logUserIn = async () => {
        if (email.length === 0){
            alert("Veuillez renseignez votre adresse mail.")
        }
        else if (password.length === 0){
            alert("Veuillez renseignez votre mot de passe.")
        }
        else{
            await httpClient.post('//localhost:5000/login',{
                email: email,
                password: password
            })
            .then(function (response){
                setUser(response.data.user);
                console.log(response);
                navigate("/");
            })
            .catch(function (error){
                console.log(error, 'error');
                if (error.response.status === 401){
                alert('Identifiants invalides');
                }
            })
        }
    }

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-md-9 col-lg-6 col-xl-5">
                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" className="img-fluid" alt="Sample"/>
                </div>
                <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                    <form>
                        <div data-mdb-input-init className="form-outline mb-4">
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control form-control-lg" placeholder="Entrer une adresse mail valide." />
                            <label className="form-label">Adresse mail</label>
                        </div>

                        <div data-mdb-input-init className="form-outline mb-3">
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control form-control-lg" placeholder="Entrer un mot de passe valide" />
                            <label className="form-label">Mot de passe</label>
                        </div>

                        <div className="text-center text-lg-start mt-4 pt-2">
                            <button type="button" onClick={logUserIn} data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Se connecter</button>
                            <p className="small fw-bold mt-2 pt-1 mb-0">Vous n'avez pas de compte? <a href="./register" className="link-danger">Créer un compte</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
