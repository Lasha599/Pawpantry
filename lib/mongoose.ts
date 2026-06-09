import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

const cache = global as typeof global & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cache.mongoose) {
  cache.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cache.mongoose!.conn) return cache.mongoose!.conn;
  if (!cache.mongoose!.promise) {
    cache.mongoose!.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      bufferCommands: false,
    });
  }
  cache.mongoose!.conn = await cache.mongoose!.promise;
  return cache.mongoose!.conn;
}
