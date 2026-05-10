import { createBrowserRouter } from "react-router";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import StartPage from "./pages/StartPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: StartPage,
  },
  {
    path: "/lobby",
    Component: LobbyPage,
  },
  {
    path: "/permainan",
    Component: GamePage,
  },
]);
