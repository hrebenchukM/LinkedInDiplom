import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { validateDeploymentConfig } from "./shared/lib/deploymentConfig";
import "./app/styles.css";

validateDeploymentConfig();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
