import React, { useState, useContext } from "react";
import { FaHeart, FaRandom, FaFilter, FaSearch, FaStar } from "react-icons/fa";
import "../styles/SearchButtons.css";
import { useTranslation } from "react-i18next";
import { FetchContext } from "../contexts/FetchContext";

const SearchButtons = () => {
  const { t } = useTranslation();
  const {
    setShowFavorites,
    changeDisplayMode,
    displayMode,
    getRandomStation,
    fetchTopStations,
    searchStationsByName, // Add this
  } = useContext(FetchContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // Add this

  // Add search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      searchStationsByName(searchValue);
      setSearchValue(""); // Clear input after search
    }
  };

  // Update search handler to handle both click and Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchValue.trim()) {
      e.preventDefault();
      searchStationsByName(searchValue);
      setSearchValue(""); // Clear input after search
    }
  };

  return (
    <div className="search-buttons-container">
      <div className="top-buttons">
        <button
          className={`button ${displayMode === "favorites" ? "active" : ""}`}
          onClick={() => changeDisplayMode("favorites")}
        >
          <FaHeart size={24} /> {t("My favorites")}
        </button>
        <button className="button" onClick={() => getRandomStation()}>
          <FaRandom size={24} /> {t("Random channels")}
        </button>
        <button
          className={`button ${displayMode === "topvote" ? "active" : ""}`}
          onClick={() => {
            changeDisplayMode("topvote");
            fetchTopStations();
          }}
        >
          <FaStar size={24} /> {t("Popular channels")}
        </button>
      </div>

      <div className="bottom-section">
        <div className="filter-section">
          <button
            className="button filter-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaFilter size={24} /> {t("More filters")}
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="filter-field">
                <label className="text-sm">{t("Channel name:")}</label>
                <input type="text" placeholder={t("Enter station name")} />
              </div>
              <div className="filter-field">
                <label>{t("Country:")}</label>
                <input type="text" placeholder={t("Enter country")} />
              </div>
              <div className="filter-field">
                <label>{t("Language:")}</label>
                <input type="text" placeholder={t("Enter language")} />
              </div>
              <div className="filter-field">
                <label>{t("Genre:")}</label>
                <input type="text" placeholder={t("Enter genre")} />
              </div>
              <div className="filter-field">
                <label>{t("Min. Bitrate:")}</label>
                <input type="number" placeholder={t("Enter bitrate")} />
              </div>
              <div className="codec-selection">
                <label>{t("Codec")}:</label>
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
                  <FaSearch size={24} />
                  {t("Search")}
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
            placeholder={t("Search for channels...")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="button search-button"
            id="search-button"
            onClick={handleSearch}
            disabled={!searchValue.trim()}
          >
            <FaSearch size={24} /> {t("Search")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchButtons;
