import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // supports Markdown / Rich Text
    author: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
    categories: [{ type: String }],
    tags: [{ type: String }],
    seoMeta: {
        metaTitle: { type: String, default: "" },
        metaDescription: { type: String, default: "" },
        keywords: { type: String, default: "" }
    }
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);
