// FormLogin.jsx
import React, { useState } from "react";
import "../styles/Form.css";
import logoFormLogin from "../images/logos/SoundPulse_green.png";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import FormRegistration from "./FormRegistration";

const FormLogin = ({ onClose }) => {
  const { t } = useTranslation();
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("username:", username);
    console.log("password:", password);
  };

  const handleGuestLogin = () => {
    console.log("Logging in as guest");
    onClose();
  };

  const handleSignUp = () => {
    setShowRegistration(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegistration(false);
  };

  if (showRegistration) {
    return (
      <FormRegistration
        onClose={onClose}
        onSwitchToLogin={handleSwitchToLogin}
      />
    );
  }

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="logo-container-form">
          <img src={logoFormLogin} alt="Logo" className="logo-form" />
          <p className="info-text text-sm">
            {t("Login is not required, but it will give you more features.")}
          </p>
        </div>

        <div className="form-container-login">
          <input
            type="text"
            placeholder={t("username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-form"
          />
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-form "
          />

          <button className="button" onClick={handleLogin}>
            Login
          </button>

          <div className="signup-link">
            <span className="text-m">{t("Don't have an account? ")}</span>
            <button className="signup-button" onClick={handleSignUp}>
              {t("Sign Up")}
            </button>
          </div>

          <div className="or-container">
            <hr className="divider" />
            <span className="or-text">or</span>
            <hr className="divider" />
          </div>

          <button className="button-secondary" onClick={handleGuestLogin}>
            {t("Continue as Guest")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormLogin;
