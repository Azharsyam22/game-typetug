import { createBrowserRouter, Navigate } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import LoginPage from "./pages/LoginPage";
import StartPage from "./pages/StartPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/start",
    element: (
      <ProtectedRoute>
        <StartPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/lobby",
    element: (
      <ProtectedRoute>
        <LobbyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/permainan",
    element: (
      <ProtectedRoute>
        <GamePage />
      </ProtectedRoute>
    ),
  },
]);
