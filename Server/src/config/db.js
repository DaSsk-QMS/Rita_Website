import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  let uri = process.env.MONGO_URI;
  const useMemory = process.env.USE_MEMORY_DB === 'true' || !uri;

  if (useMemory) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri('rita_website');
      console.log('⚠️  Using in-memory MongoDB (data is lost on restart).');
    } catch (err) {
      throw new Error(
        'MONGO_URI is not set and mongodb-memory-server is not available. Set MONGO_URI in .env'
      );
    }
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
