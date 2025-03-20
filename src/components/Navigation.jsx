import React, { useState, useRef, useEffect } from "react";
import { FaMoon, FaUserCircle, FaGlobe } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { languageResources } from "../contexts/TranslateContext";

import "../styles/Navigation.css";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const [showLanguages, setShowLanguages] = useState(false);
  const languageRef = useRef(null);

  const languages = [
    { code: "de", flag: "🇩🇪", name: t("German") },
    { code: "en", flag: "🇺🇸", name: t("English") },
    { code: "fr", flag: "🇫🇷", name: t("French") },
    { code: "es", flag: "🇪🇸", name: t("Spanish") },
    { code: "zh", flag: "🇨🇳", name: t("Chinese") },
    { code: "ar", flag: "🇸🇦", name: t("Arabic") },
  ];

  const toggleLanguages = () => setShowLanguages(!showLanguages);

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguages(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguages(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="icon">
          <FaMoon />
        </div>
        <div
          className={`icon language-icon ${showLanguages ? "active" : ""}`}
          ref={languageRef}
          onClick={toggleLanguages}
        >
          <FaGlobe />
          {showLanguages && (
            <ul className="language-dropdown">
              {languages.map(({ code, flag, name }) => (
                <li
                  key={code}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageSelect(code);
                  }}
                >
                  {flag} {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="icon">
          <FaUserCircle />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
