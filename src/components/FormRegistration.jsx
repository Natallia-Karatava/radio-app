import React, { useState, useEffect } from "react";
import "../styles/Form.css";
import logoFormRegistration from "../images/logos/SoundPulse_green.png";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import { useUser } from "../contexts/UserContext.jsx";

const FormRegistration = ({ onClose, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const { setUser } = useUser(); // Доступ к функции setUser из контекста
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });

  useEffect(() => {
    // Если данные пользователя уже сохранены в localStorage, устанавливаем их в state
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const { username, email } = JSON.parse(savedUser);
      setUsername(username);
      setEmail(email);
    }
  }, []);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError(t("Password doesn't match."));
      return;
    }
    setError(""); // Очищаем ошибку

    const newUser = { username, email, password };

    try {
      // Сначала пробуем отправить email
      await sendEmail(newUser);

      // Если все прошло успешно, сохраняем данные пользователя в context и localStorage
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Очистка полей после успешной регистрации
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");

      // Устанавливаем статус успешной регистрации
      setStatus({ message: t("Registration successful!"), type: "success" });

      // Закрытие модального окна через 2 секунды
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error); // Логируем ошибку

      // Если произошла ошибка при регистрации или отправке email
      setStatus({
        message: t("Registration failed. Please try again."),
        type: "error",
      });
    }
  };

  const sendEmail = async (user) => {
    const templateParams = {
      to_email: user.email,
      user_name: user.username,
      password: user.password,
      message: `Registration details for ${user.username}`,
    };

    try {
      const result = await emailjs.send(
        "service_3z7zhao",
        "template_6xdl5m5",
        templateParams,
        "LIWb9KtXvMfuCxiqy"
      );

      if (result.status !== 200) {
        throw new Error("Failed to send email."); // Если отправка email не прошла
      }
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Email sending failed.");
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="logo-container-form">
          <img src={logoFormRegistration} alt="Logo" className="logo-form" />
        </div>

        <div className="form-container-login">
          <h3>{t("Registration")}</h3>
          <input
            type="text"
            placeholder={t("username*")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-form"
          />

          <input
            type="email"
            placeholder={t("e-mail*")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-form"
          />

          <input
            type="password"
            placeholder={t("password*")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-form"
          />

          <input
            type="password"
            placeholder={t("confirm password*")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input-form"
          />

          {error && <p className="error-text-registration">{error}</p>}
          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <button className="button" onClick={handleSignUp}>
            {t("Sign Up")}
          </button>

          <div className="signup-link">
            <span className="text-m">{t("Already have an account? ")}</span>
            <button className="signup-button" onClick={onSwitchToLogin}>
              {t("Login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRegistration;
