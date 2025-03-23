import { useEffect } from "react";
import { useEffect } from "react";
import { preloadAppImages } from "../utils/imagePreloader";

const ImagePreloader = () => {
  useEffect(() => {
    preloadAppImages();
  }, []);

  return null; // This component doesn't render anything
};

export default ImagePreloader;
