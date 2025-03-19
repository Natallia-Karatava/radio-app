import { useContext, useEffect, useState } from "react";
import { FetchContext } from "../contexts/FetchContext";
import img from "../images/logos/favicon_32x32.png";
import "../styles/StationsList.css";

const StationsList = () => {
  // Add local state to track window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const {
    displayedStations,
    currentStation,
    setCurrentStation,
    isLoading,
    hasMore,
    nextPage,
    previousPage,
    currentPage,
    setItemsPerPage,
  } = useContext(FetchContext);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      // Update items per page based on window width
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

    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setItemsPerPage]); // Keep this dependency

  const handleStationClick = (station) => {
    setCurrentStation(station);
  };

  return (
    <div>
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
              <h3>{station.name}</h3>
              <p>
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
              <p>
                {station.codec} • {station.bitrate}kbps
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add pagination controls */}
      <div className="pagination-controls">
        {currentPage > 0 && <button onClick={previousPage}>Previous</button>}
        {hasMore && <button onClick={nextPage}>Next</button>}
      </div>

      {isLoading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default StationsList;
