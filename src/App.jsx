import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import SearchButtons from "./components/SearchButtons"; // Neuer Import

function App() {
  return (
    <div className="App">
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />
      <SearchButtons /> {/* Neue Komponente */}
    </div>
  );
}

export default App;
