import React, { useState } from "react";
import "../styles/Form.css";
import logoFormPassForgot from "../images/logos/SoundPulse_green.png";

const FormPasswortForgot = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    // Simple email validation
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setMessage("We have sent your username and password to your email.");
    console.log("Sending credentials to:", email);
    // Here may be a request to the server for password recovery
  };

  return (
    <div className="login-form">
      <div className="logo-container-form">
        <img src={logoFormPassForgot} alt="Logo" className="logo-form" />
      </div>

      <div className="form-container-login">
        <input
          type="email"
          placeholder="Enter your email*"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && <p className="info-text-forgot-pass">{message}</p>}

        <button onClick={handleSend}>Send username & password to email</button>
      </div>
    </div>
  );
};

export default FormPasswortForgot;
