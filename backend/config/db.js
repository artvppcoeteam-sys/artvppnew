import mongoose from "mongoose";
import dns from "dns";

if (process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

let isConnected = false;

/**
 * Connects to MongoDB database
 * Optimized for serverless environments (Vercel)
 */
const connectDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('=> Using existing database connection');
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log(`✅ MongoDB Connected: ${db.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        // Throwing error instead of process.exit(1) for serverless compatibility
        throw error;
    }
};

export default connectDB;

