// Override Vite HMR to ensure it connects to port 8080, not 5173
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('HMR: Module disposed');
  });
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
