import React, { useState } from 'react';
import { FaHeart, FaRandom, FaFilter, FaSearch, FaStar } from 'react-icons/fa';
import '../styles/SearchButtons.css';

const SearchButtons = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="search-buttons-container">
      <div className="top-buttons">
        <button className="button">
          <FaHeart size={24} /> Meine Favoriten
        </button>
        <button className="button">
          <FaRandom size={24} /> Zufällige Sender
        </button>
        <button className="button">
        <FaStar size={24} /> Beliebte Sender
        </button>
      </div>
      
      <div className="bottom-section">
        <div className="filter-section">
          <button 
            className="button filter-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaFilter size={24} /> Weitere Filter
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="filter-field">
                <label>Sendername:</label>
                <input type="text" placeholder="Sendername eingeben" />
              </div>
              <div className="filter-field">
                <label>Land:</label>
                <input type="text" placeholder="Land eingeben" />
              </div>
              <div className="filter-field">
                <label>Sprache:</label>
                <input type="text" placeholder="Sprache eingeben" />
              </div>
              <div className="filter-field">
                <label>Genre:</label>
                <input type="text" placeholder="Genre eingeben" />
              </div>
              <div className="filter-field">
                <label>Min. Bitrate:</label>
                <input type="number" placeholder="Bitrate eingeben" />
              </div>
              <div className="codec-selection">
                <label>Codec:</label>
                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" value="mp3" /> MP3
                  </label>
                  <label>
                    <input type="checkbox" value="aac" /> AAC
                  </label>
                  <label>
                    <input type="checkbox" value="ogg" /> OGG
                  </label>
                </div>
              </div>
              {/* Zusätzlicher Suchbutton im Dropdown-Menü */}
              <div className="dropdown-search-button-container">
                <button className="button dropdown-search-button">
                  <FaSearch size={24} /> Suchen
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="search-section">
          <input 
            type="text" 
            id="station-search"
            className="search-input" 
            placeholder="Sender suchen..."
          />
          <button className="button search-button" id="search-button">
            <FaSearch size={24} /> Suchen
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchButtons;
