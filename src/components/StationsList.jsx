import { useContext } from "react";
import { FetchContext } from "../contexts/FetchContext";
import img from "../images/logos/favicon_32x32.png";

const StationsList = () => {
  const {
    stationGenre,
    setCurrentStation,
    stations,
    isLoading,
    currentStation,
  } = useContext(FetchContext);

  // Improved filter with type checking
  const filteredStations =
    stationGenre === "all"
      ? stations
      : stations?.filter((station) => {
          // Handle different tag formats
          const stationTags = Array.isArray(station.tags)
            ? station.tags.join(" ").toLowerCase()
            : typeof station.tags === "string"
            ? station.tags.toLowerCase()
            : "";

          return stationTags.includes(stationGenre?.toLowerCase() || "");
        });

  const handleStationClick = (station) => {
    setCurrentStation(station);
  };

  return (
    <div>
      <div className="stations-list">
        {filteredStations?.map((station) => (
          <div
            key={station.id}
            className={`station-item ${
              currentStation?.id === station.id ? "active" : ""
            }`}
            onClick={() => handleStationClick(station)}
          >
            <div className="station-logo">
              <img src={station.favicon || img} alt="" />
            </div>
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
        ))}
      </div>

      {isLoading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default StationsList;
