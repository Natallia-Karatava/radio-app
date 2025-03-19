import { useState } from "react";
import RollingGallery from "./components/RollingGallery";

import "./App.css";

function App() {
  return (
    <>
      <h1>SoundPulse</h1>
      <RollingGallery autoplay={true} pauseOnHover={true} />
    </>
  );
}

export default App;
