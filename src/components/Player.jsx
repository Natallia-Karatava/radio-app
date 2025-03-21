// Player.jsx
import {
  EmailShareButton,
  FacebookShareButton,
  HatenaShareButton,
  InstapaperShareButton,
  LineShareButton,
  LinkedinShareButton,
  LivejournalShareButton,
  MailruShareButton,
  OKShareButton,
  PinterestShareButton,
  PocketShareButton,
  RedditShareButton,
  TelegramShareButton,
  ThreadsShareButton,
  BlueskyShareButton,
  ViberShareButton,
  VKShareButton,
  WhatsappShareButton,
  WorkplaceShareButton,
  EmailIcon,
  BlueskyIcon,
  FacebookIcon,
  HatenaIcon,
  InstapaperIcon,
  LineIcon,
  LinkedinIcon,
  LivejournalIcon,
  MailruIcon,
  OKIcon,
  PinterestIcon,
  PocketIcon,
  RedditIcon,
  TelegramIcon,
  ThreadsIcon,
  ViberIcon,
  VKIcon,
  WhatsappIcon,
  WorkplaceIcon,
} from "react-share";
import React, { useContext } from "react";
import { useState, useEffect, useRef } from "react";
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
    handleStationClick,
    displayedStations,
    like,
    handleDislike,
    isDisliked,
    getStationsToDisplay, // Add this
  } = useContext(FetchContext);

  //likeComponent
  const handleLike = () => {
    if (currentStation) {
      like();
      console.log("Liking current station:", currentStation);
    }
  };

  const onDislike = () => {
    if (currentStation) {
      handleDislike(currentStation);
      console.log("Disliking current station:", currentStation);
    }
  };
  const url = window.location.href;
  const size = 32;
  const [isShare, setIsShare] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsShare(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleShare = () => {
    setIsShare(!isShare);
    // console.log("Share state:", !isShare);
  };

  // Navigation zwischen Sendern
  const changeStation = (direction) => {
    // Early return if no stations
    if (!displayedStations?.length) return;

    // Get current list and ensure it's not empty
    const stationsToUse = getStationsToDisplay();
    if (!stationsToUse?.length) return;

    // Find current station index
    let currentIndex = currentStation
      ? stationsToUse.findIndex(
          (station) => station.stationuuid === currentStation.stationuuid
        )
      : -1;

    // If no current station or not found, start from beginning or end based on direction
    if (currentIndex === -1) {
      currentIndex = direction > 0 ? -1 : stationsToUse.length;
    }

    // Calculate new index with wrap-around
    const totalStations = stationsToUse.length;
    const newIndex = (currentIndex + direction + totalStations) % totalStations;

    // Debug info
    console.log({
      previous: currentStation?.name || "none",
      next: stationsToUse[newIndex].name,
      direction,
      currentIndex,
      newIndex,
      totalStations,
    });

    // Play the new station
    handleStationClick(stationsToUse[newIndex]);
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
    <div className="padding-section">
      <div className="player-container ">
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
                <p className="message select">
                  {t("Select a station to play")}
                </p>
              )}
            </div>
            {currentStation && (
              <div className="station-actions">
                <button
                  className="action-button like-button"
                  onClick={handleLike}
                >
                  <FaHeart size={24} />
                </button>
                <button
                  className={`action-button dislike-button ${
                    isDisliked(currentStation?.id) ? "active" : ""
                  }`}
                  onClick={onDislike}
                >
                  <FaThumbsDown size={24} />
                </button>
                <button
                  onClick={handleShare}
                  className={`action-button share-button ${
                    isShare ? "active" : ""
                  }`}
                >
                  <FaShare size={24} />
                </button>
                {isShare && (
                  <div className="socialShare">
                    <EmailShareButton
                      url={url}
                      subject="Check this out"
                      size={size}
                    >
                      <EmailIcon size={size} round />
                    </EmailShareButton>
                    <FacebookShareButton url={url} size={size}>
                      <FacebookIcon size={size} round />
                    </FacebookShareButton>
                    <HatenaShareButton url={url} size={size}>
                      <HatenaIcon size={size} round />
                    </HatenaShareButton>
                    <InstapaperShareButton url={url} size={size}>
                      <InstapaperIcon size={size} round />
                    </InstapaperShareButton>
                    <LineShareButton url={url} size={size}>
                      <LineIcon size={size} round />
                    </LineShareButton>
                    <LinkedinShareButton url={url} size={size}>
                      <LinkedinIcon size={size} round />
                    </LinkedinShareButton>
                    <LivejournalShareButton url={url} size={size}>
                      <LivejournalIcon size={size} round />
                    </LivejournalShareButton>
                    <MailruShareButton url={url} size={size}>
                      <MailruIcon size={size} round />
                    </MailruShareButton>
                    <OKShareButton url={url} size={size}>
                      <OKIcon size={size} round />
                    </OKShareButton>
                    <PinterestShareButton url={url} size={size}>
                      <PinterestIcon size={size} round />
                    </PinterestShareButton>
                    <PocketShareButton url={url} size={size}>
                      <PocketIcon size={size} round />
                    </PocketShareButton>
                    <RedditShareButton url={url} size={size}>
                      <RedditIcon size={size} round />
                    </RedditShareButton>
                    <TelegramShareButton url={url} size={size}>
                      <TelegramIcon size={size} round />
                    </TelegramShareButton>
                    <ThreadsShareButton url={url} size={size}>
                      <ThreadsIcon size={size} round />
                    </ThreadsShareButton>
                    <BlueskyShareButton url={url} size={size}>
                      <BlueskyIcon size={size} round />
                    </BlueskyShareButton>
                    <ViberShareButton url={url} size={size}>
                      <ViberIcon size={size} round />
                    </ViberShareButton>
                    <VKShareButton url={url} size={size}>
                      <VKIcon size={size} round />
                    </VKShareButton>
                    <WhatsappShareButton url={url} size={size}>
                      <WhatsappIcon size={size} round />
                    </WhatsappShareButton>
                    <WorkplaceShareButton url={url} size={size}>
                      <WorkplaceIcon size={size} round />
                    </WorkplaceShareButton>
                  </div>
                )}
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
          disabled={!displayedStations?.length} // Only disable if no stations available
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
          disabled={!displayedStations?.length} // Only disable if no stations available
        >
          <FaStepForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default Player;
