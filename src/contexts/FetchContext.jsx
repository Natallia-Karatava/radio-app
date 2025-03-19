import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { RadioBrowserApi } from "radio-browser-api";
import { useTranslation } from "react-i18next";
import "../styles/StationsList.css";

export const FetchContext = createContext();

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
  const [stationGenre, setStationGenre] = useState("all");
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

  // API setup and station fetching
  const setupApi = useCallback(
    async (genre) => {
      try {
        setIsLoading(true);
        const api = new RadioBrowserApi(fetch.bind(window), "My Radio App");

        const searchParams = {
          limit,
          ...(lang && { language: lang }),
          ...(country && { country }),
          ...(stationGenre && stationGenre !== "all" && { tag: stationGenre }),
          ...(codec && { codec }),
          ...(bitrate > 0 && { bitrate }),
        };

        const rawStations = await api.searchStations(searchParams);

        // Filter unique stations
        const seenNames = new Set();
        const uniqueStations = rawStations.filter((station) => {
          if (!station.url || !station.name) return false;
          const duplicate = seenNames.has(station.name);
          seenNames.add(station.name);
          return !duplicate;
        });

        setStations(uniqueStations);
        updateDisplayedStations(uniqueStations, 0);
        return uniqueStations;
      } catch (error) {
        console.error("Failed to fetch stations:", error);
        setErrorMessage("Failed to fetch stations");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [lang, country, stationGenre, limit, codec, bitrate]
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
        setErrorMessage("Error updating station list");
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
  const handleStationClick = async (station) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    setIsPlaying(false);
    setErrorMessage("");

    const streamUrl = station.urlResolved || station.url;
    if (!streamUrl) {
      setErrorMessage(t("No valid stream URL found for this station"));
      return;
    }

    const tryPlay = async (url) => {
      try {
        audioRef.current = new Audio(url);

        audioRef.current.addEventListener("playing", () => {
          setIsPlaying(true);
          setCurrentStation(station);
          localStorage.setItem("lastPlayedStation", JSON.stringify(station));
        });

        audioRef.current.addEventListener("pause", () => setIsPlaying(false));

        await audioRef.current.play();
      } catch (error) {
        if (url.startsWith("https://")) {
          tryPlay(url.replace("https://", "http://"));
        } else {
          setIsPlaying(false);
          setErrorMessage(
            t("Cannot play this station. Please try another one.")
          );
        }
      }
    };

    tryPlay(streamUrl);
  };

  const togglePlay = useCallback(() => {
    if (!currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Playback error:", error);
          setIsPlaying(false);
          setErrorMessage(t("Playback error. Please try again."));
        });
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
          setErrorMessage("Failed to load stations");
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

    // Actions
    togglePlay,
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
  };

  return (
    <FetchContext.Provider value={value}>{children}</FetchContext.Provider>
  );
};

export const useFetch = () => {
  const context = useContext(FetchContext);
  if (!context) {
    throw new Error("useFetch must be used within a FetchProvider");
  }
  return context;
};
