import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import StationsList from "./components/StationsList";

import "./App.css";

function App() {
  return (
    <div className="App">
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />
      <StationsList />
    </div>
  );
}

export default App;
