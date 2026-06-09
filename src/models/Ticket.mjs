import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
    reply: { type: String, default: "" },
    date: { type: Date, default: Date.now }
});

export default mongoose.model("Ticket", ticketSchema);
