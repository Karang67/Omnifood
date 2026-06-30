import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    buttonText: { type: String, default: "Order Now" },
    buttonLink: { type: String, default: "/menu" },
    priority: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    publishDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);
