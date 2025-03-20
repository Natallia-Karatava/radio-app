import { useContext, useEffect, useState } from "react";
import { FetchContext } from "../contexts/FetchContext";
import { useTranslation } from "react-i18next";
import img from "../images/logos/SoundPulse_signet.png";
import "../styles/StationsList.css";

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
  } = useContext(FetchContext);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width <= 480) {
        setItemsPerPage(6);
        // console.log("Mobile view:", width, "- 6 items");
      } else if (width <= 768) {
        setItemsPerPage(8);
        // console.log("Tablet view:", width, "- 8 items");
      } else {
        setItemsPerPage(12);
        // console.log("Desktop view:", width, "- 12 items");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setItemsPerPage]);

  const stationsToDisplay = getStationsToDisplay();
  const showPagination = displayMode === "all" && stationsToDisplay?.length > 0;

  return (
    <div className="stations-container">
      <h2 className="h2">
        {displayMode === "genre" && stationGenre
          ? `${t("Radio Stations")} - ${t(stationGenre)}`
          : displayMode === "favorites"
          ? t("My Favorites")
          : t("Radio Stations")}
      </h2>
      {isLoading && <div className="loading">{t("Loading...")}</div>}
      <div className="stations-list">
        {stationsToDisplay?.map((station) => (
          <div
            key={station.id}
            className={`station-item ${
              currentStation?.id === station.id ? "active" : ""
            }`}
            onClick={() => handleStationClick(station)}
          >
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

      {showPagination && (
        <div className="pagination-controls">
          {currentPage > 0 && (
            <button
              className="button button-next-prev"
              onClick={previousPage}
              disabled={isLoading}
            >
              {t("Previous")} {currentPage}
            </button>
          )}
          {hasMore && (
            <button
              className="button button-next-prev"
              onClick={nextPage}
              disabled={isLoading}
            >
              {t("Next")} {currentPage + 2}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StationsList;
