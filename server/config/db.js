const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medijourney';
  
  try {
    // Attempt connecting to local/remote MongoDB with a short timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Successfully connected to MongoDB at: ${primaryUri}`);
  } catch (err) {
    console.warn(`[Database] Direct MongoDB connection failed (${err.message}). Starting resilient In-Memory MongoDB Server for seamless zero-setup execution...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      
      await mongoose.connect(memUri);
      console.log(`[Database] In-Memory MongoDB Server active and connected at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Fatal: Unable to initialize MongoDB fallback:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
