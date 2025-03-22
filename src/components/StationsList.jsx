import { useContext, useEffect, useState } from "react";
import { FetchContext } from "../contexts/FetchContext";
import { useTranslation } from "react-i18next";
import img from "../images/logos/SoundPulse_signet.png";
import "../styles/StationsList.css";
import { MdDelete } from "react-icons/md";

// Add default value for itemsPerPage
const defaultItemsPerPage = 12;

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
    favorites,
    itemsPerPage,
  } = useContext(FetchContext);

  // Add new state for favorites pagination
  const [favoritesPage, setFavoritesPage] = useState(0);
  const [displayedFavorites, setDisplayedFavorites] = useState([]);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(false);

  // Update useEffect for favorites pagination with default value
  useEffect(() => {
    console.log("Favorites pagination effect running:", {
      displayMode,
      favoritesLength: favorites?.length,
      currentPage: favoritesPage,
      itemsPerPage: itemsPerPage || defaultItemsPerPage,
    });

    if (displayMode === "favorites" && Array.isArray(favorites)) {
      // Use default value if itemsPerPage is undefined
      const perPage = itemsPerPage || defaultItemsPerPage;
      const start = favoritesPage * perPage;
      const end = start + perPage;
      const slicedFavorites = favorites.slice(start, end);

      console.log("Updating displayed favorites:", {
        totalFavorites: favorites.length,
        perPage,
        start,
        end,
        slicedLength: slicedFavorites.length,
        actualSlice: slicedFavorites,
      });

      setDisplayedFavorites(slicedFavorites);
      setHasMoreFavorites(favorites.length > end);
    } else {
      console.log("Not updating displayed favorites:", {
        displayMode,
        favoritesIsArray: Array.isArray(favorites),
        favorites,
      });
    }
  }, [favorites, favoritesPage, itemsPerPage, displayMode]);

  // Add effect to handle empty page after deletion
  useEffect(() => {
    if (
      displayMode === "favorites" &&
      displayedFavorites.length === 0 &&
      favoritesPage > 0
    ) {
      console.log("Current page empty after deletion, moving to previous page");
      setFavoritesPage((prev) => prev - 1);
    }
  }, [displayedFavorites, favoritesPage, displayMode]);

  // Add navigation handlers for favorites
  const nextFavoritesPage = () => {
    if (hasMoreFavorites) {
      setFavoritesPage((prev) => prev + 1);
    }
  };

  const previousFavoritesPage = () => {
    if (favoritesPage > 0) {
      setFavoritesPage((prev) => prev - 1);
    }
  };

  // Update delete handler
  const handleDelete = (e, stationId) => {
    e.stopPropagation();
    deleteFavorite(stationId);

    // If this was the last item on the page (except first page)
    const itemsOnCurrentPage = displayedFavorites.length;
    if (itemsOnCurrentPage === 1 && favoritesPage > 0) {
      console.log("Last item on page deleted, moving to previous page");
      setFavoritesPage((prev) => prev - 1);
    }
  };

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
      <h2 className="h2 text-center">
        {displayMode === "genre" && stationGenre
          ? `${t("Radio Stations")} - ${t(stationGenre)}`
          : displayMode === "favorites"
          ? t("My Favorites")
          : displayMode === "topvote"
          ? t("Top-5 Channels")
          : t("Radio Stations")}
      </h2>

      {isEmpty ? (
        <div className="empty-message">{t("No favorites yet")}</div>
      ) : (
        <>
          {displayMode === "favorites" ? (
            <>
              <div className="stations-list">
                {displayedFavorites?.map((station, index) => (
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
                        onClick={(e) => handleDelete(e, station.id)}
                      >
                        <MdDelete size={24} />
                      </button>
                    )}
                    <div className="station-logo">
                      <img
                        src={station.favicon || img}
                        alt="radiostation logo"
                      />
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
              {/* Update the favorites pagination controls */}
              {favorites?.length > (itemsPerPage || defaultItemsPerPage) && (
                <div className="pagination-controls">
                  {/* Only show Previous button if not on first page */}
                  {favoritesPage > 0 && (
                    <button
                      className="button button-next-prev"
                      onClick={previousFavoritesPage}
                    >
                      {t("Previous")}
                    </button>
                  )}
                  {/* Only show Next button if there are more favorites */}
                  {hasMoreFavorites && (
                    <button
                      className="button button-next-prev"
                      onClick={nextFavoritesPage}
                    >
                      {t("Next")}
                    </button>
                  )}
                </div>
              )}
            </>
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
                        onClick={(e) => handleDelete(e, station.id)}
                      >
                        <MdDelete size={24} />
                      </button>
                    )}
                    <div className="station-logo">
                      <img
                        src={station.favicon || img}
                        alt="radiostation logo"
                      />
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
        </>
      )}
    </div>
  );
};

export default StationsList;
