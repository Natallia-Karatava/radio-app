export const preloadAppImages = () => {
  // Define your image paths here
  const appImages = {
    player: require("/player.webp"),
    all: require("../corousal/all.wepb"),
    classical: require("../corousal/classical.webp"),
    country: require("../corousal/country.webp"),
    dance: require("../corousal/dance.webp"),
    jazz: require("../corousal/jazz.webp"),
    pop: require("../corousal/pop.webp"),
    rock: require("../corousal/rock.webp"),
    disco: require("../corousal/disco.webp"),
    house: require("../corousal/house.webp"),
    retro: require("../corousal/retro.webp"),
    favSmall: require("../images/logos/favicon_32x32.png"),
    favLarge: require("../images/logos/favicon_64x64.png"),
    favMd: require("../images/logos/favicon_48x48.png"),
    logoBlack: require("../images/logos/SoundPulse_black.png"),
    logolGreen: require("../images/logos/SoundPulse_green.png"),
    logoSignet: require("../images/logos/SoundPulse_signet.png"),
    // Add more images as needed
  };

  // Preload function
  Object.values(appImages).forEach((imagePath) => {
    const img = new Image();
    img.src = imagePath;
  });
};
