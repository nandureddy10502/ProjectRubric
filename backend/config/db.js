import mongoose from 'mongoose';
import dns from 'dns';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/projectrubric';

  // For Atlas mongodb+srv URIs on Windows, set public DNS fallback to avoid querySrv ECONNREFUSED
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (dnsErr) {
      console.warn('[Database] Could not set custom DNS servers:', dnsErr.message);
    }
  }

  try {
    // Attempt connecting to the user-configured MongoDB Atlas / Local URI
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 12000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to primary MongoDB at ${uri}: ${err.message}`);
    console.log('[Database] Initializing fallback in-memory MongoDB server instance for seamless development...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to MongoMemoryServer at ${memUri}`);
      return conn;
    } catch (fallbackError) {
      console.error('[Database] Failed to initialize MongoDB connection:', fallbackError.message);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
