import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    openingHours: { type: String, default: "09:00 AM - 10:00 PM" },
    deliveryRadius: { type: Number, default: 5 }, // in km
    minOrder: { type: Number, default: 10 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    ratings: { type: Number, default: 4.5 }
}, { timestamps: true });

export default mongoose.model("Restaurant", restaurantSchema);
