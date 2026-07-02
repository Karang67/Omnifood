import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const clientDistPath = path.join(__dirname, "../../client/dist");
const legacyViewsPath = path.join(__dirname, "../../views");

const serveFrontend = (req, res) => {
    const indexPath = path.join(clientDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // Fallback to legacy views if client is not built yet
        res.sendFile(path.join(legacyViewsPath, "index.html"));
    }
};

const paths = [
    "/", "/menu", "/login", "/signup", "/signup-page", "/verify-email",
    "/admin", "/delivery", "/restaurant-owner", "/track/:orderId", "/about", "/press",
    "/careers", "/support", "/safety", "/terms", "/privacy", "/profile",
    "/access-denied", "/contact"
];

paths.forEach(p => {
    router.get(p, serveFrontend);
});

export default router;
