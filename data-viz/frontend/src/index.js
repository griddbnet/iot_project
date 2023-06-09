import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root from "./routes/root";
import Billing from "./routes/billing"
import MeterUsage from "./routes/meterUsage"

const router = createBrowserRouter([
  {
    path: "/",
    element:  <Root />,
  },
  {
    path: "meterUsage/:meterId",
    element: <MeterUsage />,
  },
  {
    path: "billing/:meterId/:date",
    element: <Billing />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);