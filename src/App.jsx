import "./App.css";
import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import StationsList from "./components/StationsList";
import Footer from "./components/Footer";
import PlayComponent from "./components/PlayComponent";

import FormRegistration from "./components/FormRegistration";

function App() {
  return (
    <>
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />
      <StationsList />
      <FormRegistration />
      <Footer />

      <PlayComponent />
    </>
  );
}

export default App;
