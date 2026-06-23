const socketIO = require("socket.io");

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        "http://localhost:5173", 
        "https://mycampx.vercel.app", 
        process.env.CLIENT_URL
      ].filter(Boolean),
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.on("join", async (room) => {
      socket.join(room); // the room is the userId
      console.log(`Client joined room: ${room}`);
      
      // Also join all their associated group rooms
      try {
        const { getUserGroupIds } = require('../controllers/chatController');
        const groupIds = await getUserGroupIds(room);
        groupIds.forEach(id => {
          socket.join(id);
          console.log(`Client ${room} automatically joined group room: ${id}`);
        });
      } catch (err) {
        console.error('Error auto-joining group rooms:', err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };