import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    role: { type: String, enum: ["customer", "rider", "restaurant_owner", "super_admin"], default: "customer" },
    permissions: [{ type: String }],
    isBanned: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    activityLog: [{
        action: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    
    // Rider specific logistics fields
    onboardingStatus: { type: String, enum: ["Pending", "Approved", "Suspended"], default: "Pending" },
    isOnline: { type: Boolean, default: false },
    license: { type: String, default: "" }, // Base64 image
    vehicle: { type: String, default: "" }, // Base64 image or text details
    bankDetails: { type: String, default: "" }, // Banking details
    walletBase: { type: Number, default: 0 },
    walletTips: { type: Number, default: 0 },
    walletIncentives: { type: Number, default: 0 },
    
    // Rider Leaflet.js real-time location metrics
    lat: { type: Number, default: 40.7128 },
    lng: { type: Number, default: -74.0060 },
    speed: { type: Number, default: 0 },
    
    date: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
