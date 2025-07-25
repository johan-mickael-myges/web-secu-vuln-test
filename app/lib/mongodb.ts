import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/secuweb';
const MONGODB_DB = 'secuweb';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
    var mongo: {
        conn: { client: MongoClient; db: Db } | null;
        promise: Promise<{ client: MongoClient; db: Db }> | null;
    } | undefined;
}

let cached = global.mongo;

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        cached!.promise = MongoClient.connect(MONGODB_URI).then((client) => {
            return {
                client,
                db: client.db(MONGODB_DB),
            };
        });
    }
    cached!.conn = await cached!.promise;
    return cached!.conn;
}

export async function getCollection(collectionName: string) {
    const { db } = await connectToDatabase();
    return db.collection(collectionName);
} 