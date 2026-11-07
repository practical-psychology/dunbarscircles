import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// Tell assistive tech the app has finished booting (see aria-busy in index.html)
requestAnimationFrame(() =>
  document.getElementById("root")?.setAttribute("aria-busy", "false"),
);
