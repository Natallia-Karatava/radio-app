import React, { useState } from "react";
import "../styles/Form.css";
import logoFormRegistration from "../images/logos/SoundPulse_green.png";

const FormRegistration = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    // Logic for Sign Up
    console.log("username:", username);
    console.log("password:", password);
  };

  const handleGuestLogin = () => {
    console.log("Already registered? Login");
  };

  return (
    <div className="login-form">
      <div className="logo-container-form">
        <img src={logoFormRegistration} alt="Logo" className="logo-form" />
      </div>

      <div className="form-container-login">
        <input
          type="text"
          placeholder="username*"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="password*"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="confirm password*"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="error-text-registration">{error}</p>}

        <button onClick={handleSignUp}>Sign Up</button>

        <button onClick={handleGuestLogin}>Already registered? Login</button>
      </div>
    </div>
  );
};

export default FormRegistration;
