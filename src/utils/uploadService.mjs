import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

// Initialize Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Ensure local uploads directory exists
const uploadDir = "./static/img/uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

export async function uploadToCloudinary(file) {
    if (!file) return null;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "omnifood_cms"
            });
            // Delete local file after upload
            fs.unlinkSync(file.path);
            return result.secure_url;
        } catch (error) {
            console.error("Cloudinary upload failed, using local fallback URL:", error.message);
        }
    }
    // Fallback: return static local URL
    return `/static/img/uploads/${path.basename(file.path)}`;
}

export default upload;
