import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ["Festival Offers", "Combo Offers", "Happy Hours", "Buy One Get One", "Free Delivery"], required: true },
    details: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Offer", offerSchema);
