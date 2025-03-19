import "../styles/PlayComponent.css";
import { FetchContext } from "../contexts/FetchContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const PlayComponent = () => {
  const { t } = useTranslation();
  const {
    currentStation,
    isLoading,
    isPlaying,
    togglePlay,
    handleStationClick,
    displayedStations,
    errorMessage,
  } = useContext(FetchContext);

  const handlePlayPause = () => {
    if (!currentStation || isLoading) return;
    togglePlay();
  };
  const changeStation = (direction) => {
    if (!displayedStations.length) return;
    const currentIndex = displayedStations.findIndex(
      (station) => station.id === currentStation?.id
    );
    const newIndex =
      (currentIndex + direction + displayedStations.length) %
      displayedStations.length;
    handleStationClick(displayedStations[newIndex]);
  };
  return (
    <>
      <div className="play-component">
        <button
          onClick={handlePlayPause}
          disabled={!currentStation || isLoading}
          className={isPlaying ? "playing" : ""}
        >
          {isPlaying ? t("Pause") : t("Play")}
        </button>
      </div>
      <div className="previous-component">
        <button onClick={() => changeStation(-1)}>{t("Previous")}</button>
      </div>
      <div className="next-component">
        <button onClick={() => changeStation(1)}>{t("Next")}</button>
      </div>
      <div className="information-component">
        {errorMessage ? (
          <p className="error-message">{errorMessage}</p>
        ) : (
          currentStation && (
            <>
              <h3>{currentStation.name}</h3>
              <p>
                {" "}
                {currentStation.country}:{" "}
                {Array.isArray(currentStation.tags)
                  ? currentStation.tags.join(", ")
                  : typeof currentStation.tags === "string"
                  ? currentStation.tags
                      .split(/(?=[A-Z])/)
                      .join(", ")
                      .toLowerCase()
                  : currentStation.tags}
              </p>
              <p>
                {currentStation.codec} • {currentStation.bitrate}kbps
              </p>
            </>
          )
        )}
      </div>
    </>
  );
};

export default PlayComponent;
