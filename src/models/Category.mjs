import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "/static/img/1.jpg" },
    displayOrder: { type: Number, default: 0 },
    visibility: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
