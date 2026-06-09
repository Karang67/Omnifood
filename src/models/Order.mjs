import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["Placed", "Preparing", "Out for Delivery", "Delivered"], default: "Placed" },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    
    // Logistics parameters
    distance: { type: Number, default: 0 }, // in km
    deliveryPayout: { type: Number, default: 0 }, // Rider payout
    surgeMultiplier: { type: Number, default: 1.0 }, // Surging rate
    tipAmount: { type: Number, default: 0 }, // Rider tips
    coords: {
        shopLat: { type: Number, default: 40.7128 },
        shopLng: { type: Number, default: -74.0060 },
        customerLat: { type: Number, default: 40.7306 },
        customerLng: { type: Number, default: -73.9352 }
    },
    
    date: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);
