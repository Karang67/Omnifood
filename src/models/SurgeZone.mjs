import mongoose from "mongoose";

const surgeZoneSchema = new mongoose.Schema({
    zoneName: { type: String, required: true, unique: true },
    multiplier: { type: Number, default: 1.0 },
    active: { type: Boolean, default: false }
});

export default mongoose.model("SurgeZone", surgeZoneSchema);
