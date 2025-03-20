import "./App.css";

import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import SearchButtons from "./components/SearchButtons"; // Neuer Import

import StationsList from "./components/StationsList";
import Footer from "./components/Footer";
import PlayComponent from "./components/PlayComponent";
import VolumeController from "./components/VolumeController";
import LikeComponent from "./components/LikeComponent";
import FormRegistration from "./components/FormRegistration";
import FormLogin from "./components/FormLogin";
import FormPassworeForgot from "./components/FormPassworеForgot";
import FormSettings from "./components/FormSettings";

import { FetchContext } from "./contexts/FetchContext";
import { useContext } from "react";

function App() {
  const { audioRef } = useContext(FetchContext);
  return (
    <>
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />
      <SearchButtons /> {/* Neue Komponente */}
      <LikeComponent />
      <StationsList />
      <Footer />
      {/* Delete */}
      <FormLogin />
      <hr />
      <FormRegistration />
      <hr />
      <FormPassworeForgot />
      <FormSettings />
      <hr />
      <Footer />
      {/* Delete */}
      {/* 
      <PlayComponent />
      <VolumeController audio={audioRef.current} /> */}
    </>
  );
}

export default App;
