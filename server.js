const WebSocket = require("ws");

// Create a WebSocket server
const PORT = process.env.PORT || 8080; // Use Render's dynamic port or default to 8080
const wss = new WebSocket.Server({ port: PORT });

const sessions = {}; // Store session data (desktop and controller connections)

// Handle new connections
wss.on("connection", (ws) => {
  let sessionId = null; // Track the session ID of this connection

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "register") {
      // Register the device (desktop or controller)
      sessionId = data.sessionId;
      if (!sessions[sessionId]) {
        sessions[sessionId] = { desktop: null, controller: null };
      }

      if (data.role === "desktop") {
        sessions[sessionId].desktop = ws;
        console.log(`Desktop connected for session ${sessionId}`);
      } else if (data.role === "controller") {
        sessions[sessionId].controller = ws;
        console.log(`Controller connected for session ${sessionId}`);
      }
    } else if (data.type === "action" && sessionId) {
      // Forward action message to the desktop
      const desktopWs = sessions[sessionId]?.desktop;
      if (desktopWs) {
        desktopWs.send(JSON.stringify({ type: "action", variable: data.variable }));
      }
    }
  });

  ws.on("close", () => {
    // Cleanup on disconnect
    if (sessionId) {
      const session = sessions[sessionId];
      if (session?.desktop === ws) session.desktop = null;
      if (session?.controller === ws) session.controller = null;

      // Delete session if both are disconnected
      if (!session?.desktop && !session?.controller) {
        delete sessions[sessionId];
        console.log(`Session ${sessionId} has ended`);
      }
    }
  });
});

console.log(`WebSocket server is running on port ${PORT}`);
