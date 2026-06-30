import mongoose from "mongoose";
import FoodItem from "../models/FoodItem.mjs";

export async function getFoodItems(req, res) {
    try {
        const foods = await FoodItem.find({});
        res.json(foods);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function addFoodItem(req, res) {
    const { name, description, price, imageUrl, category } = req.body;
    if (!name || !description || !price) {
        return res.status(400).json({ success: false, message: "Name, description, and price are required." });
    }
    try {
        const newFood = new FoodItem({ 
            name, 
            description, 
            price: parseFloat(price), 
            imageUrl: imageUrl || "/static/img/1.jpg", 
            category: category || "Signature" 
        });
        await newFood.save();
        res.json({ success: true, message: "Food item added successfully!", food: newFood });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteFoodItem(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid food item ID format." });
    }
    try {
        const deleted = await FoodItem.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Food item not found." });
        res.json({ success: true, message: "Food item deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
