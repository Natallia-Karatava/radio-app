import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { RadioBrowserApi } from "radio-browser-api";
import "../styles/StationsList.css";
import { useTranslation } from "react-i18next";

export const FetchContext = createContext();

export const FetchProvider = ({ children }) => {
  const { t } = useTranslation();

  // Change initial states to handle "all" cases
  const [lang, setLang] = useState(""); // Empty string for all languages
  const [country, setCountry] = useState(""); // Empty string for all countries
  const [limit, setLimit] = useState(1000); // Increased limit for more stations
  const [codec, setCodec] = useState(""); // Empty string for all codecs
  const [bitrate, setBitrate] = useState(0); // 0 for any bitrate

  // Station-related state
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [stationGenre, setStationGenre] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filteredStations, setFilteredStations] = useState([]);

  // Pagination state
  const [displayedStations, setDisplayedStations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  // Memoized API setup function
  const setupApi = useCallback(
    async (genre) => {
      try {
        setIsLoading(true);
        const api = new RadioBrowserApi(fetch.bind(window), "My Radio App");

        const searchParams = {
          limit: limit,
        };

        // Only add parameters if they have specific values
        if (lang) searchParams.language = lang;
        if (country) searchParams.country = country;
        if (stationGenre && stationGenre !== "all")
          searchParams.tag = stationGenre;
        if (codec) searchParams.codec = codec;
        if (bitrate > 0) searchParams.bitrate = bitrate;

        const rawStations = await api.searchStations(searchParams);

        // Log station data for debugging
        console.log("First station data:", rawStations[0]);

        // Filter unique stations with valid URLs
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

  // Pagination handler with error boundary
  const updateDisplayedStations = useCallback(
    (stationsArray, page) => {
      try {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedStations = stationsArray.slice(start, end);

        setDisplayedStations(paginatedStations);
        setHasMore(stationsArray.length > end);
        setCurrentPage(page);

        // Log for debugging
        console.log(`ItemsPerPage: ${itemsPerPage}`);
        console.log(
          `Showing stations ${start + 1} to ${end} of ${stationsArray.length}`
        );
      } catch (error) {
        console.error("Pagination error:", error);
        setErrorMessage("Error updating station list");
      }
    },
    [itemsPerPage]
  ); // Add itemsPerPage to dependencies

  // Add effect to update displayed stations when itemsPerPage changes
  useEffect(() => {
    if (stations.length > 0) {
      updateDisplayedStations(stations, currentPage);
    }
  }, [itemsPerPage, stations, currentPage, updateDisplayedStations]);

  // Station navigation handlers
  const nextPage = useCallback(() => {
    if (hasMore) {
      updateDisplayedStations(stations, currentPage + 1);
    }
  }, [hasMore, stations, currentPage, updateDisplayedStations]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) {
      updateDisplayedStations(stations, currentPage - 1);
    }
  }, [currentPage, stations, updateDisplayedStations]);

  // Genre change effect with cleanup
  useEffect(() => {
    let mounted = true;

    const fetchStations = async () => {
      if (!stationGenre) return;
      try {
        const fetchedStations = await setupApi(stationGenre);
        if (mounted) {
          setStations(fetchedStations);
        }
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

  // Add useEffect to filter stations when genre changes
  useEffect(() => {
    if (!stations.length) return;

    let filteredStations;
    if (stationGenre === "all") {
      filteredStations = stations;
    } else {
      filteredStations = stations.filter((station) => {
        const stationTags = Array.isArray(station.tags)
          ? station.tags.join(" ").toLowerCase()
          : typeof station.tags === "string"
          ? station.tags.toLowerCase()
          : "";
        return stationTags.includes(stationGenre.toLowerCase());
      });
    }

    // Update displayed stations with filtered results
    updateDisplayedStations(filteredStations, 0); // Reset to first page
  }, [stationGenre, stations]);

  // Reset function to restore default values
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

  const handleStationClick = async (station) => {
    // Stop current playback if any
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
        // Create new audio instance to prevent multiple streams
        audioRef.current = new Audio(url);

        // Add event listeners
        audioRef.current.addEventListener("playing", () => {
          setIsPlaying(true);
          setCurrentStation(station);
          localStorage.setItem("lastPlayedStation", JSON.stringify(station));
        });

        audioRef.current.addEventListener("pause", () => {
          setIsPlaying(false);
        });

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

  // Add toggle play function
  const togglePlay = useCallback(() => {
    if (!currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Playback error:", error);
          setIsPlaying(false);
          setErrorMessage(t("Playback error. Please try again."));
        });
    }
  }, [currentStation, isPlaying, setErrorMessage, t]);

  // Initial setup effect
  useEffect(() => {
    resetToDefaults();
    setupApi("all"); // Initial fetch with default values
  }, []); // Empty deps array ensures this runs only on mount

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const value = {
    stations,
    currentStation,
    stationGenre,
    isLoading,
    isPlaying,
    errorMessage,
    displayedStations,
    currentPage,
    hasMore,
    filteredStations,
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
