const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  const primaryUri = process.env.MONGO_URI;

  if (!primaryUri) {
    console.warn('[Database] WARNING: MONGO_URI environment variable is not defined!');
  }

  const uri = primaryUri || 'mongodb://127.0.0.1:27017/medijourney';

  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    };
    
    console.log(`[Database] Connecting to MongoDB...`);
    const conn = await mongoose.connect(uri, opts);
    cachedConnection = conn;
    console.log(`[Database] Successfully connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database] Direct MongoDB connection failed: ${err.message}`);

    // If running in local development (not Vercel) and no Atlas, attempt MongoMemoryServer
    if (!process.env.VERCEL && !process.env.MONGO_URI) {
      try {
        console.log('[Database] Starting In-Memory MongoDB Server for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        cachedConnection = conn;
        console.log(`[Database] In-Memory MongoDB connected at: ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[Database] In-Memory MongoDB fallback failed:', memErr.message);
      }
    }
    
    // In serverless / production, rethrow so the route/middleware can handle it cleanly without crashing the container
    throw err;
  }
};

module.exports = connectDB;
