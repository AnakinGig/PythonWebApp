import { useState } from "react";
import httpClient from '../httpClient'

function Register() {

  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [password, setPassword] = useState('');

    const registerUserIn = () => {
        if (email.length === 0){
            alert("Veuillez renseignez votre adresse mail.")
        }
        else if (password.length === 0){
            alert("Veuillez renseignez votre mot de passe.")
        }
        else{
            httpClient.post('//localhost:5000/register',{
                email: email,
                first_name: first_name,
                last_name: last_name,
                password: password
            })
            .then(resp =>{
                console.log(resp)
                window.location.href = "/"
            })
            .catch(error => {
                console.log(error, 'error');
                if (error.response.status === 401){
                    alert('Identifiants invalides');
                }
            });
        }
    };

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center">
            <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-md-9 col-lg-6 col-xl-5">
                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp" className="img-fluid" alt="Sample"/>
                </div>
                <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                    <form>
                        <div className="row mb-4">
                            <div className="form-outline col-6">
                                <input type="email" id="email" value={last_name} onChange={(e) => setLastName(e.target.value)} className="form-control form-control-lg" placeholder="Entrer votre nom." />
                                <label className="form-label">Nom</label>
                            </div>
                            <div className="form-outline col-6">
                                <input type="email" id="email" value={first_name} onChange={(e) => setFirstName(e.target.value)} className="form-control form-control-lg" placeholder="Entrer votre prénom." />
                                <label className="form-label">Prénom</label>
                            </div>
                        </div>
                        <div className="form-outline mb-4">
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control form-control-lg" placeholder="Entrer votre adresse mail." />
                            <label className="form-label">Adresse mail</label>
                        </div>

                        <div className="form-outline mb-3">
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control form-control-lg" placeholder="Entrer votre mot de passe." />
                            <label className="form-label">Mot de passe</label>
                        </div>

                        <div className="text-center text-lg-start mt-4 pt-2">
                            <button type="button" onClick={registerUserIn} className="btn btn-primary btn-lg">Créer un compte</button>
                            <p className="small fw-bold mt-2 pt-1 mb-0">Vous avez déjà un compte? <a href="./register" className="link-danger">Se connecter</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
