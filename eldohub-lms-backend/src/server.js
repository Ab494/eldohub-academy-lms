import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║   Eldohub LMS Backend Running       ║
║   Port: ${config.port}                          ║
║   Environment: ${config.nodeEnv}         ║
║   URL: http://localhost:${config.port}          ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
