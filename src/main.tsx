import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Tailwind's dark: variants follow prefers-color-scheme, but the plain `.dark`
// CSS rules (body background, color-scheme) need the class on <html> to apply.
const scheme = window.matchMedia("(prefers-color-scheme: dark)");
function syncColorScheme() {
  document.documentElement.classList.toggle("dark", scheme.matches);
}
syncColorScheme();
scheme.addEventListener("change", syncColorScheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
