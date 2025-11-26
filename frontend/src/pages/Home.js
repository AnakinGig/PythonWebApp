import React from "react";

const Home = ({ user }) => {
  return (
    <div>
      <h1>Application test - React Flask</h1>
      <br />
      {!user ? (
        <div>
          <p>Vous n'êtes pas connecter.</p>
        </div>
      ) : (
        <div className="d-flex flex-column">
          <h2>Bonjour {user.first_name} {user.last_name}.</h2>
          <br></br>
          <h4>Id: {user.id}</h4>
          <h4>Email: {user.email}</h4>
          <h4>Role: {user.role}</h4>
          <br></br>
        </div>
      )}
    </div>
  );
};

export default Home;
