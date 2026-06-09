import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/customerData");
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        console.warn("WARNING: Server will continue running, but database operations will fail without an active MongoDB connection.");
    }
}

export default connectDB;
