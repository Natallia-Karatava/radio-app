// Player.jsx
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaHeart,
  FaThumbsDown,
  FaShare,
} from "react-icons/fa";
import VolumeController from "./VolumeController";
import { FetchContext } from "../contexts/FetchContext";
import "../styles/Player.css";

const Player = ({ audio }) => {
  const { t } = useTranslation();
  const {
    currentStation,
    isLoading,
    isPlaying,
    handlePlayPause,
    errorMessage,
    togglePlay,
    handleStationClick,
    displayedStations,
  } = useContext(FetchContext);

  // Navigation zwischen Sendern
  const changeStation = (direction) => {
    if (!displayedStations.length) return;

    const currentIndex = displayedStations.findIndex(
      (station) => station.id === currentStation?.id
    );

    let newIndex;
    if (direction === -1 && currentIndex === 0) {
      newIndex = displayedStations.length - 1;
    } else if (
      direction === 1 &&
      currentIndex === displayedStations.length - 1
    ) {
      newIndex = 0;
    } else {
      newIndex = currentIndex + direction;
    }

    handleStationClick(displayedStations[newIndex]);
  };

  // Hilfsfunktion zum Formatieren der Tags
  const formatTags = (tags) => {
    if (Array.isArray(tags)) return tags.join(", ");
    if (typeof tags === "string") {
      return tags
        .split(/(?=[A-Z])/)
        .join(", ")
        .toLowerCase();
    }
    return tags;
  };

  // Hilfsfunktion zum Kürzen des Stationsnamens
  const truncateStationName = (name) => {
    if (name.length > 28) {
      return name.substring(0, 28) + "...";
    }
    return name;
  };

  return (
    <div className="player-container">
      <img src="/player.webp" alt="Player" className="player-background" />

      {/* Now Playing Info Box */}
      <div className="now-playing-info">
        <div className="station-content">
          <div className="station-text">
            {isLoading ? (
              <p className="message loading">{t("Loading...")}</p>
            ) : errorMessage ? (
              <p className="message error">{errorMessage}</p>
            ) : currentStation ? (
              <>
                <h3 title={currentStation.name}>
                  {truncateStationName(currentStation.name)}
                </h3>
                <p className="station-country">{currentStation.country}</p>
                <p className="quality">
                  {currentStation.codec} • {currentStation.bitrate}kbps
                </p>
              </>
            ) : (
              <p className="message select">{t("Select a station to play")}</p>
            )}
          </div>
          {currentStation && (
            <div className="station-actions">
              <button className="action-button like-button">
                <FaHeart size={24} />
              </button>
              <button className="action-button dislike-button">
                <FaThumbsDown size={24} />
              </button>
              <button className="action-button share-button">
                <FaShare size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Volume Controller */}
      <div className="volume-controller-position">
        <VolumeController audio={audio} />
      </div>

      {/* Play Controls */}
      <button
        className="previous-button"
        onClick={() => changeStation(-1)}
        disabled={!currentStation || isLoading}
      >
        <FaStepBackward size={24} />
      </button>

      <button
        className="play-button"
        onClick={handlePlayPause}
        disabled={!currentStation || isLoading}
      >
        {isPlaying ? (
          <FaPause size={30} className="fa-pause" />
        ) : (
          <FaPlay size={30} className="fa-play" />
        )}
      </button>

      <button
        className="next-button"
        onClick={() => changeStation(1)}
        disabled={!currentStation || isLoading}
      >
        <FaStepForward size={24} />
      </button>
    </div>
  );
};

export default Player;
