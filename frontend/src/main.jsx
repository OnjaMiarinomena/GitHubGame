import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App.jsx";

// Import de ton fichier CSS global
import "@/assets/styles/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
