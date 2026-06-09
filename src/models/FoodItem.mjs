import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "/static/img/1.jpg" },
    category: { type: String, default: "Signature" }
});

export default mongoose.model("FoodItem", foodItemSchema);
