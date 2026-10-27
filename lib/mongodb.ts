import { MongoClient } from "mongodb";

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!global.mongoClientPromise) {
    global.mongoClientPromise = new MongoClient(uri).connect();
  }

  return global.mongoClientPromise;
}
