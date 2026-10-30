const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (uri) {
      console.log(`[Database] Attempting connection to MongoDB URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] Successfully connected to MongoDB Atlas / Remote database.`);
      return;
    }

    // Fallback: If no MONGODB_URI provided, attempt local default, or start mongodb-memory-server
    try {
      console.log(`[Database] Checking local MongoDB on mongodb://127.0.0.1:27017/accessloop...`);
      await mongoose.connect('mongodb://127.0.0.1:27017/accessloop', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[Database] Connected to local MongoDB daemon.`);
      return;
    } catch (localErr) {
      console.log(`[Database] Local MongoDB daemon not running. Initializing MongoMemoryServer...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to zero-config in-memory MongoDB (${memUri}). Full persistence & transaction simulation active.`);
    }
  } catch (error) {
    console.error(`[Database Error] Failed to initialize database:`, error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
