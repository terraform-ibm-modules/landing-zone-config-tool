import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./index.scss";
import App from "./App.js";
import * as serviceWorker from "./serviceWorker.js";
import { HashRouter as Router } from "react-router-dom";

createRoot(document.getElementById("root")).render(<Router><App /></Router>);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
