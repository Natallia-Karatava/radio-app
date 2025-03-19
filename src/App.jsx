import "./App.css";
import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import StationsList from "./components/StationsList";
import Footer from "./components/Footer";




function App() {
  return (
    <div className="App">
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />
    
      <StationsList />

      <Footer />
    </div>
  );
}

export default App;
