import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import NewDataframe from "./pages/NewDataframe.tsx";
import ViewDataframe from "./pages/ViewDataframe.tsx";
import ListDataframe from "./pages/ListDataframe.tsx";
import { Toaster } from "@/components/ui/toaster";

const Dashboard = () => {
  return (
    <div className="flex flex-col space-y-4 justify-center items-center pt-12">
      <div className="p-4 w-full  md:w-1/2">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <Dashboard />,
    children: [
      {
        path: "/",
        element: <ListDataframe />,
      },
      {
        path: "new",
        element: <NewDataframe />,
      },
      {
        path: ":pk",
        element: <ViewDataframe />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
