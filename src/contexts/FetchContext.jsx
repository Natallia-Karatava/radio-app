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
import { debounce } from "lodash";
import "../styles/StationsList.css";
import ReactDOM from "react-dom";

// Create and export the context
export const FetchContext = createContext(null);

// Export the hook
export const UseFetch = () => {
  const { t } = useTranslation();
  const context = useContext(FetchContext);
  if (!context) {
    throw new Error(t("UseFetch must be used within a FetchProvider"));
  }
  return context;
};

// Export the provider component
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
  const [searchedStations, setSearchedStations] = useState([]); // Add new state for searched stations

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Move debouncedSetError here, right after state declarations
  const debouncedSetError = useCallback(
    debounce((message) => setErrorMessage(message), 300),
    []
  );

  const saveToStorage = useCallback((key, value) => {
    // Debounce storage operations
    const debouncedSave = debounce((k, v) => {
      try {
        const serialized = JSON.stringify(v);
        if (window.requestIdleCallback) {
          requestIdleCallback(() => {
            localStorage.setItem(k, serialized);
          });
        } else {
          localStorage.setItem(k, serialized);
        }
      } catch (err) {
        console.error("Storage error:", err);
      }
    }, 300);

    debouncedSave(key, value);
  }, []);

  // Pagination state
  const [displayedStations, setDisplayedStations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  //LikeComponent.jsx
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const [displayMode, setDisplayMode] = useState("all"); // 'all', 'favorites', 'genre'

  const like = useCallback(() => {
    console.log("Like function called with current station:", currentStation);

    if (!currentStation) {
      console.log("No current station in context");
      return;
    }

    setFavorites((prevFavorites) => {
      const isExisting = prevFavorites.some(
        (fav) => fav.id === currentStation.id
      );
      const newFavorites = isExisting
        ? prevFavorites.filter((fav) => fav.id !== currentStation.id)
        : [...prevFavorites, currentStation];

      saveToStorage("favouriteStations", newFavorites);
      console.log("Updated favorites:", newFavorites);
      return newFavorites;
    });
  }, [currentStation, saveToStorage]);
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favouriteStations");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  useEffect(() => {
    console.log("Current favorites:", favorites);
  }, [favorites]);

  const deleteFavorite = useCallback(
    (stationId) => {
      setFavorites((prevFavorites) => {
        const newFavorites = prevFavorites.filter(
          (fav) => fav.id !== stationId
        );
        saveToStorage("favouriteStations", newFavorites);
        return newFavorites;
      });
    },
    [saveToStorage]
  );

  // Add new state for disliked stations
  const [dislikedStations, setDislikedStations] = useState(() => {
    const saved = localStorage.getItem("dislikedStations");
    return saved ? JSON.parse(saved) : [];
  });

  // Add dislike handler
  const handleDislike = useCallback(
    (station) => {
      if (!station) return;

      setDislikedStations((prev) => {
        const isDisliked = prev.some((s) => s.id === station.id);
        const newDislikes = isDisliked
          ? prev.filter((s) => s.id !== station.id)
          : [...prev, station];

        saveToStorage("dislikedStations", newDislikes);
        console.log("Updated disliked stations:", newDislikes);
        return newDislikes;
      });
    },
    [saveToStorage]
  );

  // Add isDisliked check
  const isDisliked = useCallback(
    (stationId) => {
      return dislikedStations.some((station) => station.id === stationId);
    },
    [dislikedStations]
  );

  const API_CONFIG = {
    headers: {
      "User-Agent": "SoundPulse Radio/1.0",
      "Content-Type": "application/json",
    },
  };

  const API_BASE_URL = "https://de1.api.radio-browser.info";

  // Modify the api initialization
  const api = useMemo(() => {
    const controllers = new Map();

    const createNewController = (requestId) => {
      // Cleanup existing controller for this request
      if (controllers.has(requestId)) {
        const { controller, timeoutId } = controllers.get(requestId);
        clearTimeout(timeoutId);
        controller.abort();
        controllers.delete(requestId);
      }

      // Create new controller with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        controllers.delete(requestId);
      }, 30000);

      controllers.set(requestId, { controller, timeoutId });
      return controller.signal;
    };

    const fetchWithRetry = async (url, options, retries = 3) => {
      const requestId = Math.random().toString(36).substring(7);

      for (let i = 0; i < retries; i++) {
        try {
          options.signal = createNewController(requestId);
          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Cleanup on success
          if (controllers.has(requestId)) {
            const { timeoutId } = controllers.get(requestId);
            clearTimeout(timeoutId);
            controllers.delete(requestId);
          }

          return await response.json();
        } catch (error) {
          const isLastAttempt = i === retries - 1;
          const isAborted = error.name === "AbortError";

          if (isLastAttempt) throw error;
          if (isAborted) {
            console.log(`Attempt ${i + 1} timed out, retrying...`);
            // Wait before retry with exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, i) * 1000)
            );
            continue;
          }
          throw error;
        }
      }
    };

    return {
      searchStations: async (params) => {
        try {
          const url = `${API_BASE_URL}/json/stations/search?${new URLSearchParams(
            params
          )}`;
          return await fetchWithRetry(url, { ...API_CONFIG }, 3);
        } catch (error) {
          console.error("API Error:", error);
          if (error.name === "AbortError") {
            throw new Error(t("Request timed out. Please try again."));
          }
          throw error;
        }
      },
      cleanup: () => {
        // Cleanup all pending requests
        controllers.forEach(({ controller, timeoutId }) => {
          clearTimeout(timeoutId);
          controller.abort();
        });
        controllers.clear();
      },
    };
  }, [t]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      api.cleanup();
    };
  }, [api]);

  // API setup and station fetching
  const setupApi = useCallback(
    async (genre) => {
      try {
        setIsLoading(true);

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
        debouncedSetError(t("Failed to fetch stations"));
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
        // Batch state updates
        ReactDOM.unstable_batchedUpdates(() => {
          const start = page * itemsPerPage;
          const end = start + itemsPerPage;
          const paginatedStations = stationsArray.slice(start, end);

          setDisplayedStations(paginatedStations);
          setHasMore(stationsArray.length > end);
          setCurrentPage(page);
        });
      } catch (error) {
        console.error("Pagination error:", error);
        debouncedSetError(t("Error updating station list"));
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

  const createAudioHandlers = useCallback((onSuccess, onError) => {
    return {
      handlePlaying: () => {
        setIsPlaying(true);
        setIsLoading(false);
        onSuccess?.();
      },
      handleError: () => {
        setIsPlaying(false);
        setIsLoading(false);
        onError?.();
      },
    };
  }, []);

  const setupAudioEvents = useCallback((audio, handlers) => {
    if (!audio) return;

    // Use passive event listeners where possible
    const options = { passive: true };

    audio.addEventListener("playing", handlers.handlePlaying, options);
    audio.addEventListener("error", handlers.handleError, options);

    return () => {
      audio.removeEventListener("playing", handlers.handlePlaying);
      audio.removeEventListener("error", handlers.handleError);
    };
  }, []);

  const handleStationClick = async (station) => {
    if (isChangingStation) return;

    try {
      setIsChangingStation(true);
      setIsLoading(true);
      debouncedSetError("");

      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      setIsPlaying(false);

      const streamUrl = station.urlResolved || station.url;
      if (!streamUrl) {
        throw new Error("No valid stream URL found");
      }

      const tryPlay = async (url) => {
        try {
          const audio = new Audio(url);

          // Set a timeout for loading attempt
          const loadPromise = new Promise((resolve, reject) => {
            audio.addEventListener("canplay", resolve, { once: true });
            audio.addEventListener("error", reject, { once: true });
            setTimeout(() => reject(new Error("Loading timeout")), 5000);
          });

          await loadPromise;
          audioRef.current = audio;
          await audio.play();

          setCurrentStation(station);
          saveToStorage("lastPlayedStation", station);
          setIsPlaying(true);
        } catch (error) {
          if (url.startsWith("https://")) {
            await tryPlay(url.replace("https://", "http://"));
          } else {
            throw error;
          }
        }
      };

      await tryPlay(streamUrl);
    } catch (error) {
      console.error("Station playback failed:", error);
      setIsPlaying(false);
      setCurrentStation(null);
      debouncedSetError(t("Cannot play this station. Try next station."));
      // Automatically try next station on failure
      changeStation(1);
    } finally {
      setIsLoading(false);
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
            debouncedSetError("");
          })
          .catch((error) => {
            console.error("Playback error:", error);
            setIsPlaying(false);
            debouncedSetError(t("Cannot resume playback. Please try again."));
          });
      }
    } catch (error) {
      console.error("PlayPause error:", error);
      setIsPlaying(false);
      debouncedSetError(t("Playback control failed"));
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
          debouncedSetError(t("Failed to load stations"));
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
    debouncedSetError("");
  }, []);

  // Modify the last played station effect
  useEffect(() => {
    const lastPlayedStation = localStorage.getItem("lastPlayedStation");
    if (lastPlayedStation) {
      const station = JSON.parse(lastPlayedStation);
      console.log("Loaded last played station:", station);

      // Check if the station is in the disliked list
      const isStationDisliked = dislikedStations.some(
        (disliked) => disliked.id === station.id
      );

      if (isStationDisliked) {
        debouncedSetError(
          t("You don't like this station. Please choose another one.")
        );
        setCurrentStation(null);
        // Clear the last played station from storage
        localStorage.removeItem("lastPlayedStation");
      } else {
        setCurrentStation(station);
        // Initialize audio source without autoplay
        const streamUrl = station.urlResolved || station.url;
        if (streamUrl && audioRef.current) {
          audioRef.current.src = streamUrl;
          audioRef.current.load();
        }
      }
    } else {
      console.log("No last played station found");
    }
  }, [dislikedStations, debouncedSetError, t]); // Add dependencies

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
      case "searched":
        return searchedStations;
      default:
        return displayedStations;
    }
  }, [displayMode, favorites, displayedStations, searchedStations]); // Update getStationsToDisplay to include search results

  const changeDisplayMode = useCallback((mode, genre = null) => {
    setDisplayMode(mode);
    if (genre) {
      setStationGenre(genre);
    }
  }, []);

  const getRandomStation = useCallback(async () => {
    try {
      if (!stations || stations.length === 0) {
        debouncedSetError(t("No stations available"));
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
      debouncedSetError(t("Failed to play random station"));
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
      debouncedSetError(t("Failed to fetch top stations"));
    } finally {
      setIsLoading(false);
    }
  };

  // Replace direct localStorage calls with saveToStorage:
  useEffect(() => {
    if (currentStation) saveToStorage("lastPlayedStation", currentStation);
    saveToStorage("favouriteStations", favorites);
    saveToStorage("dislikedStations", dislikedStations);
  }, [favorites, dislikedStations, currentStation, saveToStorage]);

  const cleanupAudio = useCallback((audio) => {
    if (!audio) return;
    audio.pause();
    audio.src = "";
    const events = ["playing", "error", "loadstart", "loadeddata"];
    events.forEach((event) => {
      audio.removeEventListener(event, audio[`_${event}Handler`]);
    });
  }, []);

  // Use in component cleanup
  useEffect(() => {
    return () => cleanupAudio(audioRef.current);
  }, [cleanupAudio]);

  const filteredAndUniqueStations = useMemo(() => {
    const seenNames = new Set();
    const dislikedIds = new Set(dislikedStations.map((s) => s.id));

    return stations.filter((station) => {
      if (!station.url || !station.name || dislikedIds.has(station.id))
        return false;
      const duplicate = seenNames.has(station.name);
      seenNames.add(station.name);
      return !duplicate;
    });
  }, [stations, dislikedStations]);

  const observerRef = useRef();

  const lastStationElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          nextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, nextPage]
  );

  useEffect(() => {
    const errorHandler = (error) => {
      console.error("Caught runtime error:", error);
      debouncedSetError(t("An error occurred"));
      setIsLoading(false);
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  const searchStationsByName = useCallback(
    async (searchValue) => {
      if (!searchValue.trim()) {
        setDisplayMode("all");
        return;
      }

      try {
        setIsLoading(true);
        // Fix the API endpoint URL
        const response = await fetch(
          `${API_BASE_URL}/json/stations/search?name=${encodeURIComponent(
            searchValue
          )}&limit=100`,
          {
            headers: {
              "User-Agent": "RadioBrowserApp/1.0",
              "Content-Type": "application/json",
            },
            mode: "cors",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();

        // Filter out disliked stations
        const filteredResults = results.filter(
          (station) => !dislikedStations.some((ds) => ds.id === station.id)
        );

        setSearchedStations(filteredResults);
        setDisplayMode("searched");
        updateDisplayedStations(filteredResults, 0);

        if (filteredResults.length === 0) {
          console.log("No stations found");
        }
      } catch (error) {
        console.error("Search error:", error);
        console.log("Search failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, dislikedStations, updateDisplayedStations, t]
  );

  const value = {
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

    // Infinite scroll
    lastStationElementRef,

    // Search functionality
    searchStationsByName,
    searchedStations,
  };

  return (
    <FetchContext.Provider value={value}>{children}</FetchContext.Provider>
  );
};
