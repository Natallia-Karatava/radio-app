import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import StationsList from "./components/StationsList";
import Footer from "./components/Footer";


import "./App.css";

import FormRegistration from "./components/FormRegistration";


function App() {
  return (
    <div className="App">
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />

      <StationsList />




      <FormRegistration />

      <Footer />

    </div>
  );
}

export default App;
