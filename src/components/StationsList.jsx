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

  const [currentSourceArray, setCurrentSourceArray] = useState([]);
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

  // Update the stationsToDisplay useMemo with debug logging
  const stationsToDisplay = useMemo(() => {
    let sourceArray = [];
    let total = 0;

    // Get and validate source array
    switch (displayMode) {
      case "searched":
        if (Array.isArray(searchedStations)) {
          sourceArray = [...searchedStations];
          total = searchedStations.length;
        }
        break;
      case "genre":
      case "all":
        const stations = getStationsToDisplay();
        console.log("GetStationsToDisplay Result:", {
          rawStations: stations,
          isArray: Array.isArray(stations),
          length: stations?.length,
          displayMode,
          genre: stationGenre,
        });

        if (Array.isArray(stations)) {
          sourceArray = stations;
          total = stations.length;
        }
        break;
      default:
        sourceArray = [];
        total = 0;
    }

    // Store total before pagination
    setTotalItems(total);

    // Calculate pagination
    const start = currentPage * localItemsPerPage;
    const end = start + localItemsPerPage;

    // Fix hasMore calculation - check if there are any items after the current slice
    const hasMoreItems = total > end;
    setHasMoreLocal(hasMoreItems);

    console.log("Final Source Array:", {
      mode: displayMode,
      sourceArrayLength: sourceArray.length,
      paginatedLength: sourceArray.slice(start, end).length,
      hasMore: hasMoreItems,
      total,
    });

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

  // Update showPagination calculation
  const showPagination = useMemo(() => {
    const totalPages = Math.ceil(totalItems / localItemsPerPage);
    const shouldShowPagination =
      (displayMode === "all" ||
        displayMode === "genre" ||
        displayMode === "searched") &&
      totalPages > 1 && // Show pagination if there's more than one page
      !isEmpty;

    console.log("Pagination State:", {
      mode: displayMode,
      totalItems,
      itemsPerPage: localItemsPerPage,
      totalPages,
      currentPage,
      shouldShow: shouldShowPagination,
      hasMore: hasMoreLocal,
    });

    return shouldShowPagination;
  }, [
    displayMode,
    totalItems,
    localItemsPerPage,
    isEmpty,
    hasMoreLocal,
    currentPage,
  ]);

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
