import "./server/config/env.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { ALLOWED_ORIGINS, sendJson } from "./server/utils/http.js";
import { handleAuthRequest } from "./server/routes/auth.js";
import { setupSocket } from "./server/socket/index.js";

const PORT = process.env.PORT || 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

httpServer.on("request", (req, res) => {
  handleAuthRequest(req, res).then((handled) => {
    if (!handled && !res.writableEnded && !req.url?.startsWith("/socket.io")) {
      sendJson(req, res, 404, { message: "Not found" });
    }
  });
});

setupSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server is running on port ${PORT}`);
});
