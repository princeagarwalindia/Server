const WebSocket = require("ws");

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Broadcast function to send a message to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Connection event
wss.on("connection", ws => {
  console.log("A client connected");

  ws.on("message", message => {
    console.log(`Received: ${message}`);
    // Broadcast the message to all clients
    broadcast(message);
  });

  ws.on("close", () => {
    console.log("A client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
