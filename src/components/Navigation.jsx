import React, { useState, useRef, useEffect } from "react";
import { FaMoon, FaUserCircle, FaGlobe } from "react-icons/fa";

import "../styles/Navigation.css";

const Navigation = () => {
  const [showLanguages, setShowLanguages] = useState(false);
  const languageRef = useRef(null);

  const toggleLanguages = () => setShowLanguages(!showLanguages);

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
              <li>🇩🇪 German</li>
              <li>🇺🇸 English</li>
              <li>🇫🇷 French</li>
              <li>🇪🇸 Spanish</li>
              <li>🇨🇳 Chinese</li>
              <li>🇸🇦 Arabic</li>
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
