import { useContext, useEffect, useState } from "react";
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
  const isEmpty =
    displayMode === "favorites" &&
    (!stationsToDisplay || stationsToDisplay.length === 0);

  const showPagination =
    (displayMode === "all" || displayMode === "genre") &&
    stationsToDisplay?.length > 0 &&
    !isEmpty;

  return (
    <div className={`stations-container ${isEmpty ? "empty-favorites" : ""}`}>
      <h2 className="h2">
        {displayMode === "genre" && stationGenre
          ? `${t("Radio Stations")} - ${t(stationGenre)}`
          : displayMode === "favorites"
          ? t("My Favorites")
          : t("Radio Stations")}
      </h2>

      {isEmpty ? (
        <div className="empty-message">{t("No favorites yet")}</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default StationsList;
