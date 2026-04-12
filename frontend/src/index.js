import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/store-theme.css";
import "./styles/store-components.css";
import "./styles/store-pages.css";
import "./styles/orders-page.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { AuthProvider } from "./context/AuthContext";  // ✅ IMPORT AT TOP

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
