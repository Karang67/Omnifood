import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
    name:         { type: String, required: true },
    email:        { type: String, required: true },
    passwordHash: { type: String, required: true },
    phone:        { type: String, default: "" },
    address:      { type: String, default: "" },
    role:         { type: String, enum: ["customer", "admin", "delivery"], default: "customer" },
    otp:          { type: String, required: true },
    otpExpiry:    { type: Date, required: true },
    createdAt:    { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
});

export default mongoose.model("PendingUser", pendingUserSchema);
