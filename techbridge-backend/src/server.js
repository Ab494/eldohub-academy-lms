import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { initSocket } from './socket.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║   TechBridge Academy LMS Backend Running       ║
║   Port: ${config.port}                          ║
║   Environment: ${config.nodeEnv}         ║
║   URL: http://localhost:${config.port}          ║
║   WebSocket: enabled                    ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
