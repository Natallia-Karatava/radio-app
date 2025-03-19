import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FetchProvider } from "./contexts/FetchContext.jsx";
import { I18nextProvider } from "react-i18next";
import TranslateContext from "./contexts/TranslateContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={TranslateContext}>
      <FetchProvider>
        <App />
      </FetchProvider>
    </I18nextProvider>
  </StrictMode>
);
