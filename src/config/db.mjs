import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/customerData");
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("FATAL: Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}

export default connectDB;
