import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, "../../views");

const router = express.Router();

router.get("/", (req, res) => res.sendFile(path.join(viewsPath, "index.html")));
router.get("/contact-page", (req, res) => res.sendFile(path.join(viewsPath, "contact.html")));
router.get("/signup-page", (req, res) => res.sendFile(path.join(viewsPath, "signup.html")));
router.get("/login-page", (req, res) => res.sendFile(path.join(viewsPath, "login.html")));
router.get("/menu", (req, res) => res.sendFile(path.join(viewsPath, "menu.html")));
router.get("/admin", (req, res) => res.sendFile(path.join(viewsPath, "admin.html")));
router.get("/delivery", (req, res) => res.sendFile(path.join(viewsPath, "delivery.html")));
router.get("/track/:orderId", (req, res) => res.sendFile(path.join(viewsPath, "track.html")));

// Static footer pages
router.get("/about", (req, res) => res.sendFile(path.join(viewsPath, "about.html")));
router.get("/press", (req, res) => res.sendFile(path.join(viewsPath, "press.html")));
router.get("/careers", (req, res) => res.sendFile(path.join(viewsPath, "careers.html")));
router.get("/support", (req, res) => res.sendFile(path.join(viewsPath, "support.html")));
router.get("/safety", (req, res) => res.sendFile(path.join(viewsPath, "safety.html")));
router.get("/terms", (req, res) => res.sendFile(path.join(viewsPath, "terms.html")));
router.get("/privacy", (req, res) => res.sendFile(path.join(viewsPath, "privacy.html")));

// User Profile Page
router.get("/profile", (req, res) => res.sendFile(path.join(viewsPath, "profile.html")));

export default router;
