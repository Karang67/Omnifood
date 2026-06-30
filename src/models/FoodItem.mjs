import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "/static/img/1.jpg" },
    category: { type: String, default: "Signature" },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },
    discount: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    recommended: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    prepTime: { type: Number, default: 15 },
    nutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    inventory: { type: Number, default: 50 },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("FoodItem", foodItemSchema);
