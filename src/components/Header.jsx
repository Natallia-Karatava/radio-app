import React from "react";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <img
        className="logo"
        src="/src/images/logos/SoundPulse_green.png"
        alt="SoundPulse Logo"
      />
      <h2 className="title">
        Willkommen bei deiner Radio App. <br /> Dein Sound, deine Stimmung, dein Radio!
      </h2>
    </header>
  );
};

export default Header;
