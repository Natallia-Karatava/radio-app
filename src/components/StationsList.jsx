import { useContext, useEffect, useState, useMemo } from "react";
import { FetchContext } from "../contexts/FetchContext";
import { useTranslation } from "react-i18next";
import img from "../images/logos/SoundPulse_signet.png";
import "../styles/StationsList.css";
import { MdDelete } from "react-icons/md";

const StationsList = () => {
  const { t } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(() => {
    const width = window.innerWidth;
    return width <= 480 ? 6 : width <= 768 ? 8 : 12;
  });

  const [totalItems, setTotalItems] = useState(0);
  const [hasMoreLocal, setHasMoreLocal] = useState(false);

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

  // Move isEmpty declaration before it's used
  const isEmpty =
    (displayMode === "favorites" &&
      (!stationsToDisplay || stationsToDisplay.length === 0)) ||
    (displayMode === "searched" &&
      (!searchedStations || searchedStations.length === 0));

  // Update stationsToDisplay with better mode handling
  const stationsToDisplay = useMemo(() => {
    let sourceArray;
    let total;

    // Different handling for each display mode
    switch (displayMode) {
      case "searched":
        sourceArray = searchedStations || [];
        total = searchedStations?.length || 0;
        break;
      case "genre":
      case "all":
        sourceArray = getStationsToDisplay() || [];
        total = sourceArray.length;
        console.log("Genre/All Mode:", {
          mode: displayMode,
          total,
          genre: stationGenre,
        });
        break;
      default:
        sourceArray = [];
        total = 0;
    }

    // Calculate pagination
    const start = currentPage * localItemsPerPage;
    const end = start + localItemsPerPage;

    console.log("Pagination State:", {
      mode: displayMode,
      total,
      start,
      end,
      currentPage,
      itemsPerPage: localItemsPerPage,
    });

    // Update states
    setTotalItems(total);
    setHasMoreLocal(end < total);

    return sourceArray.slice(start, end);
  }, [
    displayMode,
    searchedStations,
    getStationsToDisplay,
    currentPage,
    localItemsPerPage,
    stationGenre,
  ]);

  // Update resize handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      const newItemsPerPage = width <= 480 ? 6 : width <= 768 ? 8 : 12;

      setLocalItemsPerPage(newItemsPerPage);
      setItemsPerPage(newItemsPerPage); // Update context state
    };

    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setItemsPerPage]);

  // Update showPagination logic after isEmpty and stationsToDisplay are defined
  const showPagination = useMemo(() => {
    return (
      (displayMode === "all" ||
        displayMode === "genre" ||
        displayMode === "searched") &&
      totalItems > localItemsPerPage &&
      !isEmpty
    );
  }, [displayMode, totalItems, localItemsPerPage, isEmpty]);

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
              {hasMoreLocal && ( // Use local hasMore instead of context hasMore
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
