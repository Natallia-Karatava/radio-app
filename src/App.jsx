import "./App.css";

import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import SearchButtons from "./components/SearchButtons";
import Player from "./components/Player"; // Neuer Import für die Player-Komponente
import StationsList from "./components/StationsList";
import Footer from "./components/Footer";
import PlayComponent from "./components/PlayComponent";

import FormRegistration from "./components/FormRegistration";

import { FetchContext } from "./contexts/FetchContext";
import { useContext } from "react";

function App() {
  const { audioRef } = useContext(FetchContext);
  return (
    <>
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />
      <SearchButtons />
      <Player audio={audioRef.current} /> {/* Neue Player-Komponente */}
      <StationsList />
      <FormRegistration />
      <Footer />

      <PlayComponent />
      {/* VolumeController wurde in die Player-Komponente verschoben */}
    </>
  );
}

export default App;
