import { useContext, useEffect, useState, useMemo } from "react";
import { FetchContext } from "../contexts/FetchContext";
import { useTranslation } from "react-i18next";
import img from "../images/logos/SoundPulse_signet.png";
import "../styles/StationsList.css";
import { MdDelete } from "react-icons/md";

const StationsList = () => {
  const { t } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const {
    displayMode,
    getStationsToDisplay,
    currentStation,
    isLoading,
    hasMore,
    nextPage,
    previousPage,
    currentPage,
    setItemsPerPage,
    stationGenre,
    handleStationClick,
    deleteFavorite,
    searchedStations,
  } = useContext(FetchContext);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width <= 480) {
        setItemsPerPage(6);
      } else if (width <= 768) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(12);
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => window.removeEventListener("resize", handleResize);
  }, [setItemsPerPage]); // Only depend on setItemsPerPage

  const stationsToDisplay = useMemo(() => {
    if (displayMode === "searched" && searchedStations?.length > 0) {
      return searchedStations;
    }
    return getStationsToDisplay();
  }, [displayMode, searchedStations, getStationsToDisplay]);

  const isEmpty =
    (displayMode === "favorites" &&
      (!stationsToDisplay || stationsToDisplay.length === 0)) ||
    (displayMode === "searched" &&
      (!searchedStations || searchedStations.length === 0));

  const showPagination =
    (displayMode === "all" ||
      displayMode === "genre" ||
      displayMode === "searched") &&
    stationsToDisplay?.length > 0 &&
    !isEmpty;

  return (
    <div className={`stations-container ${isEmpty ? "empty-favorites" : ""}`}>
      <h2 className="h2 text-center">
        {displayMode === "genre" && stationGenre
          ? `${t("Radio Stations")} - ${t(stationGenre)}`
          : displayMode === "favorites"
          ? t("My Favorites")
          : displayMode === "topvote"
          ? t("Top-5 Channels")
          : displayMode === "searched"
          ? t("Search Results")
          : t("Radio Stations")}
      </h2>

      {isEmpty ? (
        <div className="empty-message">
          {displayMode === "favorites"
            ? t("No favorites yet")
            : displayMode === "searched"
            ? t("No stations found")
            : t("No stations available")}
        </div>
      ) : (
        <>
          <div className="stations-list">
            {stationsToDisplay?.map((station, index) => (
              <div
                key={index}
                className={`station-item ${
                  currentStation?.id === station.id ? "active" : ""
                }`}
                onClick={() => handleStationClick(station)}
              >
                {" "}
                {displayMode === "favorites" && (
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFavorite(station.id);
                    }}
                  >
                    <MdDelete size={24} />
                  </button>
                )}
                <div className="station-logo">
                  <img src={station.favicon || img} alt="radiostation logo" />
                </div>
                <div className="station-description">
                  <p className="text-m">{station.name}</p>
                  <p className="text-xs">
                    {station.country}:{" "}
                    {Array.isArray(station.tags)
                      ? station.tags.join(", ")
                      : typeof station.tags === "string"
                      ? station.tags
                          .split(/(?=[A-Z])/)
                          .join(", ")
                          .toLowerCase()
                      : station.tags}
                  </p>
                  <p className="text-xs">
                    {station.codec} • {station.bitrate}kbps
                  </p>
                </div>
              </div>
            ))}
          </div>

          {showPagination && displayMode !== "topvote" && (
            <div className="pagination-controls">
              {currentPage > 0 && (
                <button
                  className="button button-next-prev"
                  onClick={previousPage}
                  disabled={isLoading}
                >
                  {t("Previous")}
                </button>
              )}
              {hasMore && (
                <button
                  className="button button-next-prev"
                  onClick={nextPage}
                  disabled={isLoading}
                >
                  {t("Next")}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StationsList;
