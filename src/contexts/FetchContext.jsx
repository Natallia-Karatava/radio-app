import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { RadioBrowserApi } from "radio-browser-api";
import { useTranslation } from "react-i18next";
import "../styles/StationsList.css";

export const FetchContext = createContext({
  nextStation: () => {},
  previousStation: () => {},
});

export const FetchProvider = ({ children }) => {
  const { t } = useTranslation();
  const audioRef = useRef(new Audio());

  // Search parameters
  const [lang, setLang] = useState("");
  const [country, setCountry] = useState("");
  const [limit, setLimit] = useState(1000);
  const [codec, setCodec] = useState("");
  const [bitrate, setBitrate] = useState(0);

  // Station state
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [stationGenre, setStationGenre] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Pagination state
  const [displayedStations, setDisplayedStations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  //LikeComponent.jsx
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const [showFavorites, setShowFavorites] = useState(false);

  const [displayMode, setDisplayMode] = useState("all"); // 'all', 'favorites', 'genre'

  const like = useCallback(() => {
    if (!currentStation) return;

    // Check if station is already in favorites
    const isAlreadyFavorite = favorites.some(
      (fav) => fav.id === currentStation.id
    );

    if (isAlreadyFavorite) {
      console.log("Station already in favorites:", currentStation.name);
      return; // Do nothing if already favorited
    }

    // Add to favorites only if not already present
    const newFavorites = [...favorites, currentStation];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    console.log("Added to favorites:", currentStation.name);
  }, [currentStation, favorites]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favouriteStations");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  useEffect(() => {
    console.log("Current favorites:", favorites);
  }, [favorites]);

  const deleteFavorite = useCallback((stationId) => {
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.filter((fav) => fav.id !== stationId);
      localStorage.setItem("favouriteStations", JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Add new state for disliked stations
  const [dislikedStations, setDislikedStations] = useState(() => {
    const saved = localStorage.getItem("dislikedStations");
    return saved ? JSON.parse(saved) : [];
  });

  // Add dislike handler
  const handleDislike = useCallback((station) => {
    if (!station) return;

    setDislikedStations((prev) => {
      const isDisliked = prev.some((s) => s.id === station.id);
      const newDislikes = isDisliked
        ? prev.filter((s) => s.id !== station.id)
        : [...prev, station];

      localStorage.setItem("dislikedStations", JSON.stringify(newDislikes));
      console.log("Updated disliked stations:", newDislikes);
      return newDislikes;
    });
  }, []);

  // Add isDisliked check
  const isDisliked = useCallback(
    (stationId) => {
      return dislikedStations.some((station) => station.id === stationId);
    },
    [dislikedStations]
  );

  // API setup and station fetching
  const setupApi = useCallback(
    async (genre) => {
      try {
        setIsLoading(true);
        const api = new RadioBrowserApi(
          "https://de1.api.radio-browser.info",
          fetch.bind(window),
          {
            headers: {
              "User-Agent": "SoundPulse Radio/1.0",
              "Content-Type": "application/json",
            },
          }
        );

        const searchParams = {
          limit,
          ...(lang && { language: lang }),
          ...(country && { country }),
          ...(stationGenre && stationGenre !== "all" && { tag: stationGenre }),
          ...(codec && { codec }),
          ...(bitrate > 0 && { bitrate }),
        };

        const rawStations = await api.searchStations(searchParams);

        // Filter unique stations and exclude disliked ones
        const seenNames = new Set();
        const uniqueStations = rawStations.filter((station) => {
          if (!station.url || !station.name) return false;
          const duplicate = seenNames.has(station.name);
          const isDislikedStation = dislikedStations.some(
            (s) => s.id === station.id
          );
          seenNames.add(station.name);
          return !duplicate && !isDislikedStation;
        });

        setStations(uniqueStations);
        updateDisplayedStations(uniqueStations, 0);
        return uniqueStations;
      } catch (error) {
        console.error("Failed to fetch stations:", error);
        setErrorMessage(t("Failed to fetch stations"));
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [lang, country, stationGenre, limit, codec, bitrate, dislikedStations] // Add dislikedStations to dependencies
  );

  // Pagination handlers
  const updateDisplayedStations = useCallback(
    (stationsArray, page) => {
      try {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedStations = stationsArray.slice(start, end);

        setDisplayedStations(paginatedStations);
        setHasMore(stationsArray.length > end);
        setCurrentPage(page);
      } catch (error) {
        console.error("Pagination error:", error);
        setErrorMessage(t("Error updating station list"));
      }
    },
    [itemsPerPage]
  );

  const nextPage = useCallback(() => {
    if (hasMore) updateDisplayedStations(stations, currentPage + 1);
  }, [hasMore, stations, currentPage, updateDisplayedStations]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) updateDisplayedStations(stations, currentPage - 1);
  }, [currentPage, stations, updateDisplayedStations]);

  // Audio control handlers
  const [isChangingStation, setIsChangingStation] = useState(false); // Add this state

  // Add check for disliked station
  const handleStationClick = async (station) => {
    if (isChangingStation) return;

    try {
      setIsChangingStation(true);
      setErrorMessage(t("Loading..."));
      setIsLoading(true);

      // Clear any previous error states
      setErrorMessage("");

      // Only check if station is disliked, but don't show message
      if (isDisliked(station.id)) {
        setIsPlaying(false);
        return;
      }

      // Stop and cleanup current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.removeEventListener("playing", null);
        audioRef.current.removeEventListener("error", null);
      }

      setIsPlaying(false);
      setCurrentStation(station);

      const streamUrl = station.urlResolved || station.url;
      if (!streamUrl) {
        setIsLoading(false);
        setErrorMessage(t("No valid stream URL found"));
        return;
      }

      const tryPlay = async (url) => {
        try {
          const audio = new Audio(url);
          let playbackStarted = false;

          const onPlaying = () => {
            playbackStarted = true;
            setIsPlaying(true);
            setIsLoading(false);
            setErrorMessage("");
            localStorage.setItem("lastPlayedStation", JSON.stringify(station));
          };

          const onError = () => {
            if (!playbackStarted) {
              setIsPlaying(false);
              setIsLoading(false);
              setErrorMessage(
                t("Cannot play this station. Please try another one.")
              );
            }
          };

          audio.addEventListener("playing", onPlaying);
          audio.addEventListener("error", onError);

          audioRef.current = audio;
          await audio.play();
        } catch (error) {
          throw error;
        }
      };

      await tryPlay(streamUrl);
    } catch (error) {
      console.error("Station playback failed:", error);
      setIsPlaying(false);
      setIsLoading(false);
      setErrorMessage(t("Cannot play this station. Please try another one."));
    } finally {
      setIsChangingStation(false);
    }
  };

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !currentStation) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setErrorMessage("");
          })
          .catch((error) => {
            console.error("Playback error:", error);
            setIsPlaying(false);
            setErrorMessage(t("Cannot resume playback. Please try again."));
          });
      }
    } catch (error) {
      console.error("PlayPause error:", error);
      setIsPlaying(false);
      setErrorMessage(t("Playback control failed"));
    }
  }, [currentStation, isPlaying, t]);

  // Reset function
  const resetToDefaults = useCallback(() => {
    setLang("");
    setCountry("");
    setLimit(1000);
    setCodec("");
    setBitrate(0);
    setStationGenre("all");
    setCurrentStation(null);
    setCurrentPage(0);
  }, []);

  // Effects
  useEffect(() => {
    if (stations.length > 0) {
      updateDisplayedStations(stations, currentPage);
    }
  }, [itemsPerPage, stations, currentPage, updateDisplayedStations]);

  useEffect(() => {
    let mounted = true;
    const fetchStations = async () => {
      if (!stationGenre) return;
      try {
        const fetchedStations = await setupApi(stationGenre);
        if (mounted) setStations(fetchedStations);
      } catch (error) {
        if (mounted) {
          setStations([]);
          setErrorMessage(t("Failed to load stations"));
        }
      }
    };

    fetchStations();
    return () => {
      mounted = false;
    };
  }, [stationGenre, setupApi]);

  useEffect(() => {
    resetToDefaults();
    setupApi("all");
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Add effect to reset error message on mount
  useEffect(() => {
    setErrorMessage("");
  }, []);

  // Add this effect after other useEffect declarations
  useEffect(() => {
    const lastPlayedStation = localStorage.getItem("lastPlayedStation");
    if (lastPlayedStation) {
      const station = JSON.parse(lastPlayedStation);
      console.log("Loaded last played station:", station);
      setCurrentStation(station);

      // Initialize audio source without autoplay
      const streamUrl = station.urlResolved || station.url;
      if (streamUrl && audioRef.current) {
        audioRef.current.src = streamUrl;
        // Pre-load the audio
        audioRef.current.load();
      }
    } else {
      console.log("No last played station found");
    }
  }, []);

  // Add effect to log disliked stations changes
  useEffect(() => {
    console.log("Current disliked stations:", dislikedStations);
  }, [dislikedStations]);

  // Add effect to log initial disliked stations
  useEffect(() => {
    const savedDislikes = localStorage.getItem("dislikedStations");
    if (savedDislikes) {
      console.log(
        "Loaded disliked stations from storage:",
        JSON.parse(savedDislikes)
      );
    }
  }, []);

  useEffect(() => {
    if (stations.length > 0) {
      // Filter out disliked stations from current stations
      const filteredStations = stations.filter(
        (station) => !dislikedStations.some((s) => s.id === station.id)
      );
      setStations(filteredStations);
      updateDisplayedStations(filteredStations, 0);
    }
  }, [dislikedStations]); // Re-run when disliked stations change

  const getStationsToDisplay = useCallback(() => {
    switch (displayMode) {
      case "favorites":
        return favorites;
      case "genre":
        return displayedStations;
      default:
        return displayedStations;
    }
  }, [displayMode, favorites, displayedStations]);

  const changeDisplayMode = useCallback((mode, genre = null) => {
    setDisplayMode(mode);
    if (genre) {
      setStationGenre(genre);
    }
  }, []);

  const getRandomStation = useCallback(async () => {
    try {
      if (!stations || stations.length === 0) {
        setErrorMessage(t("No stations available"));
        return;
      }

      setIsLoading(true);
      const randomIndex = Math.floor(Math.random() * stations.length);
      const randomStation = stations[randomIndex];

      if (randomStation) {
        await handleStationClick(randomStation);
        changeDisplayMode("all"); // Reset display mode to show all stations
        console.log("Playing random station:", randomStation.name);
      }
    } catch (error) {
      console.error("Error playing random station:", error);
      setErrorMessage(t("Failed to play random station"));
    } finally {
      setIsLoading(false);
    }
  }, [stations, handleStationClick, changeDisplayMode, setErrorMessage, t]);

  const fetchTopStations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://at1.api.radio-browser.info/json/stations/topvote/5"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch top stations");
      }

      const data = await response.json();
      setStations(data);
      updateDisplayedStations(data, 0);
      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching top stations:", error);
      setErrorMessage(t("Failed to fetch top stations"));
    } finally {
      setIsLoading(false);
    }
  };

  // Add navigation functions
  const nextStation = useCallback(async () => {
    if (!stations.length || !currentStation) return;

    try {
      const currentIndex = stations.findIndex(
        (station) => station.id === currentStation.id
      );
      const nextIndex = (currentIndex + 1) % stations.length;
      await handleStationClick(stations[nextIndex]);
    } catch (error) {
      console.error("Next station error:", error);
      setErrorMessage(t("Failed to play next station"));
    }
  }, [currentStation, stations, handleStationClick, setErrorMessage, t]);

  const previousStation = useCallback(async () => {
    if (!stations.length || !currentStation) return;

    try {
      const currentIndex = stations.findIndex(
        (station) => station.id === currentStation.id
      );
      const prevIndex =
        currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
      await handleStationClick(stations[prevIndex]);
    } catch (error) {
      console.error("Previous station error:", error);
      setErrorMessage(t("Failed to play previous station"));
    }
  }, [currentStation, stations, handleStationClick, setErrorMessage, t]);

  const contextValue = useMemo(
    () => ({
      // Station data
      stations,
      currentStation,
      stationGenre,
      filteredStations,
      displayedStations,

      // UI state
      isLoading,
      isPlaying,
      errorMessage,
      currentPage,
      hasMore,
      audioRef,

      // LikeComponent.jsx
      favorites,
      like,
      showFavorites,
      setShowFavorites,

      // Actions
      setIsPlaying,
      setCurrentStation,
      setStationGenre,
      setErrorMessage,
      updateDisplayedStations,
      nextPage,
      previousPage,
      setupApi,
      setLimit,
      setFilteredStations,
      resetToDefaults,
      setItemsPerPage,
      handleStationClick,
      setFavorites,

      // Display mode
      displayMode,
      changeDisplayMode,
      getStationsToDisplay,

      deleteFavorite,
      getRandomStation,
      handlePlayPause,
      fetchTopStations,

      // Dislike functionality
      handleDislike,
      isDisliked,
      dislikedStations,

      // Navigation functions
      nextStation,
      previousStation,
    }),
    [
      stations,
      currentStation,
      stationGenre,
      filteredStations,
      displayedStations,
      isLoading,
      isPlaying,
      errorMessage,
      currentPage,
      hasMore,
      audioRef,
      favorites,
      like,
      showFavorites,
      setShowFavorites,
      setIsPlaying,
      setCurrentStation,
      setStationGenre,
      setErrorMessage,
      updateDisplayedStations,
      nextPage,
      previousPage,
      setupApi,
      setLimit,
      setFilteredStations,
      resetToDefaults,
      setItemsPerPage,
      handleStationClick,
      setFavorites,
      displayMode,
      changeDisplayMode,
      getStationsToDisplay,
      deleteFavorite,
      getRandomStation,
      handlePlayPause,
      fetchTopStations,
      handleDislike,
      isDisliked,
      dislikedStations,
      nextStation,
      previousStation,
    ]
  );

  return (
    <FetchContext.Provider value={contextValue}>
      {children}
    </FetchContext.Provider>
  );
};

export const useFetch = () => {
  const context = useContext(FetchContext);
  if (!context) {
    throw new Error(t("useFetch must be used within a FetchProvider"));
  }
  return context;
};
