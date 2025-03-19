import React from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import RollingGallery from "./components/RollingGallery";
import Footer from "./components/Footer";

import "./App.css";
import FormLogin from "./components/FormLogin";

function App() {
  return (
    <div className="App">
      <Navigation />
      <Header />
      <RollingGallery autoplay={true} pauseOnHover={true} />
      <FormLogin />
      <Footer />
    </div>
  );
}

export default App;
