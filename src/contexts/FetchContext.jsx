import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { RadioBrowserApi } from "radio-browser-api";

export const FetchContext = createContext();

export const FetchProvider = ({ children }) => {
  const [lang, setLang] = useState("english");
  const [country, setCountry] = useState("Germany");
  const [limit, setLimit] = useState(100);
  const [codec, setCodec] = useState("mp3");
  const [bitrate, setBitrate] = useState(128);

  // Station-related state
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [stationGenre, setStationGenre] = useState("pop");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Pagination state
  const [displayedStations, setDisplayedStations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Memoized API setup function
  const setupApi = useCallback(async (genre) => {
    try {
      setIsLoading(true);
      const api = new RadioBrowserApi(fetch.bind(window), "My Radio App");

      const rawStations = await api.searchStations({
        language: lang,
        country: country,
        tag: stationGenre,
        limit: limit,
        codec: codec,
        bitrate: bitrate,
      });

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
  }, []);

  // Pagination handler with error boundary
  const updateDisplayedStations = useCallback((stationsArray, page) => {
    try {
      const start = page * 20;
      const end = start + 20;
      setDisplayedStations(stationsArray.slice(start, end));
      setHasMore(stationsArray.length > end);
      setCurrentPage(page);
    } catch (error) {
      console.error("Pagination error:", error);
      setErrorMessage("Error updating station list");
    }
  }, []);

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

  const value = {
    stations,
    currentStation,
    stationGenre,
    isLoading,
    errorMessage,
    displayedStations,
    currentPage,
    hasMore,
    setCurrentStation,
    setStationGenre,
    setErrorMessage,
    updateDisplayedStations,
    nextPage,
    previousPage,
    setupApi,
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
