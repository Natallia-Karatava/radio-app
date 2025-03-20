import { useContext, useEffect, useState } from "react";
import { FetchContext } from "../contexts/FetchContext";
import { useTranslation } from "react-i18next";
import img from "../images/logos/SoundPulse_signet.png";
import "../styles/StationsList.css";

const StationsList = () => {
  const { t } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const {
    displayedStations,
    currentStation,
    isLoading,
    hasMore,
    nextPage,
    previousPage,
    currentPage,
    setItemsPerPage,
    handleStationClick,
  } = useContext(FetchContext);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width <= 480) {
        setItemsPerPage(6);
        console.log("Mobile view:", width, "- 6 items");
      } else if (width <= 768) {
        setItemsPerPage(8);
        console.log("Tablet view:", width, "- 8 items");
      } else {
        setItemsPerPage(12);
        console.log("Desktop view:", width, "- 12 items");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setItemsPerPage]);

  return (
    <div className="stations-container">
      <h2 className="h2">Radio station</h2>
      <div className="stations-list">
        {displayedStations?.map((station) => (
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

      <div className="pagination-controls">
        {currentPage > 0 && (

          <button className="button button-next-prev" onClick={previousPage}>
         {t("Previous")}
          </button>
        )}
        {hasMore && (
          <button className="button button-next-prev" onClick={nextPage}>
            {t("Next")}
          </button>
        )}

      </div>

      {isLoading && <div className="loading">{t("Loading...")}</div>}
    </div>
  );
};

export default StationsList;
