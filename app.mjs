import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Force Google DNS — system DNS blocks SRV records needed for MongoDB Atlas

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/config/db.mjs";
import bcrypt from "bcryptjs";
import FoodItem from "./src/models/FoodItem.mjs";
import SurgeZone from "./src/models/SurgeZone.mjs";
import User from "./src/models/User.mjs";
import viewRoutes from "./src/routes/viewRoutes.mjs";
import authRoutes from "./src/routes/authRoutes.mjs";
import apiRoutes from "./src/routes/apiRoutes.mjs";
import adminRoutes from "./src/routes/adminRoutes.mjs";
import { seedFeatureFlags } from "./src/utils/seedFeatureFlags.mjs";

// Derive path variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();
const port = process.env.PORT || 9000;
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
app.set('io', io);

// Enforce secure JWT fallback checking in production
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    console.error("CRITICAL SECURITY ERROR: JWT_SECRET must be set in production mode!");
    process.exit(1);
}

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Content-Security-Policy", "default-src 'self' https://unpkg.com https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https://unpkg.com https://*.openstreetmap.org; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com https://accounts.google.com/gsi/style; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://accounts.google.com/gsi/client; font-src 'self' https://unpkg.com https://fonts.gstatic.com; connect-src 'self' https://accounts.google.com/gsi/ ws: wss: https://unpkg.com https://cdn.jsdelivr.net; frame-src 'self' https://accounts.google.com/");
    next();
});

// Middlewares
app.use(cookieParser());

// Dynamic Platform Maintenance Check
app.use(async (req, res, next) => {
    if (
        req.path.startsWith("/static") || 
        req.path.startsWith("/api/admin") || 
        req.path.startsWith("/api/auth") || 
        req.path.startsWith("/admin") ||
        req.path.startsWith("/login") ||
        req.path.startsWith("/access-denied")
    ) {
        return next();
    }
    try {
        const CmsConfig = (await import("./src/models/CmsConfig.mjs")).default;
        const configObj = await CmsConfig.findOne({});
        if (configObj && configObj.website && configObj.website.maintenanceMode) {
            const token = req.cookies.token;
            if (token) {
                try {
                    const jwt = (await import("jsonwebtoken")).default;
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_omnifood_key_12345");
                    if (decoded.role === "super_admin") {
                        return next();
                    }
                } catch (e) {}
            }
            return res.status(503).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Platform Maintenance</title>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
                    <style>
                        body { background: #0b0f19; color: #fff; font-family: 'Outfit', sans-serif; text-align: center; padding: 120px 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 80vh; }
                        h1 { color: #e23744; font-size: 2.8rem; margin: 0 0 16px; font-weight: 800; }
                        p { color: rgba(255,255,255,0.7); font-size: 1.1rem; line-height: 1.6; max-width: 500px; margin: 0; }
                    </style>
                </head>
                <body>
                    <h1>Under Scheduled Maintenance</h1>
                    <p>We are currently upgrading the Omnifood servers to introduce fresh gourmet menus. We'll be back shortly!</p>
                </body>
                </html>
            `);
        }
    } catch (err) {
        console.error("Maintenance middleware crash:", err.message);
    }
    next();
});
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'client/dist')));

// Debug endpoint for deployment verification
app.get('/debug/version', (req, res) => {
    res.json({
        status: 'ok',
        nodeEnv: process.env.NODE_ENV || 'undefined',
        deploymentCommit: '9e23560',
        emailTransportFamily: 4
    });
});

// Mount MVC Routers
app.use("/api/auth", authRoutes); // Authentication APIs
app.use("/", apiRoutes);          // Main Order and Admin APIs
app.use("/", adminRoutes);        // Admin CMS configurations
app.use("/", viewRoutes);         // Frontend View router serving pages

// Gourmet food seeding catalog data
const defaultFoods = [
    { name: "Korean Bibimbap", description: "Organic rice bowl packed with fresh vegetables, seasoned egg, and traditional sauce.", price: 15.00, imageUrl: "/static/img/1.jpg", category: "Signature" },
    { name: "Margherita Pizza", description: "Authentic Italian crust with sweet cherry tomatoes, fresh mozzarella, and aromatic basil.", price: 18.00, imageUrl: "/static/img/2.jpg", category: "Signature" },
    { name: "Grilled Chicken Breast", description: "Organic skinless breast grilled to perfection with oven-roasted seasonal vegetables.", price: 16.50, imageUrl: "/static/img/3.jpg", category: "Healthy" },
    { name: "Autumn Pumpkin Soup", description: "Warm, velvety pumpkin cream soup prepared with wild spices and toasted pumpkin seeds.", price: 10.50, imageUrl: "/static/img/4.jpg", category: "Starter" },
    { name: "Paleo Beef Steak", description: "Premium grass-fed beef tenderloin served with grilled asparagus and garlic butter.", price: 22.00, imageUrl: "/static/img/5.jpg", category: "Premium" },
    { name: "Breakfast Baguette", description: "Fresh whole-grain baguette stuffed with poached egg, fresh spinach, and ripe tomatoes.", price: 12.00, imageUrl: "/static/img/6.jpg", category: "Healthy" }
];

async function seedFoodCatalog() {
    try {
        const count = await FoodItem.countDocuments();
        if (count === 0) {
            await FoodItem.insertMany(defaultFoods);
            console.log("Database food catalog successfully seeded with signature Omnifood meals!");
        }
    } catch (error) {
        console.error("Failed to seed database food catalog:", error.message);
    }
}

// Surge zones seeding data
const defaultSurges = [
    { zoneName: "Downtown Manhattan", multiplier: 1.5, active: true },
    { zoneName: "Midtown Crossing", multiplier: 1.2, active: true },
    { zoneName: "Uptown Express", multiplier: 1.8, active: false }
];

async function seedSurgeZones() {
    try {
        const count = await SurgeZone.countDocuments();
        if (count === 0) {
            await SurgeZone.insertMany(defaultSurges);
            console.log("Database surge zones successfully seeded!");
        }
    } catch (error) {
        console.error("Failed to seed database surge zones:", error.message);
    }
}

// Automatically migrate legacy roles to exactly the 4 requested RBAC roles
async function migrateUserRoles() {
    try {
        const adminRes = await User.updateMany({ role: "admin" }, { role: "super_admin" });
        if (adminRes.modifiedCount > 0) {
            console.log(`Successfully migrated ${adminRes.modifiedCount} "admin" users to "super_admin"`);
        }

        const deliveryRes = await User.updateMany({ role: "delivery" }, { role: "rider" });
        if (deliveryRes.modifiedCount > 0) {
            console.log(`Successfully migrated ${deliveryRes.modifiedCount} "delivery" users to "rider"`);
        }
    } catch (error) {
        console.error("User roles migration failed:", error.message);
    }
}

// Seed default Super Admin account if not exists
async function seedSuperAdmin() {
    try {
        const adminCount = await User.countDocuments({ role: "super_admin" });
        if (adminCount === 0) {
            if (process.env.NODE_ENV === "production") {
                console.warn("No super_admin account found. In production, create an admin account manually instead of seeding a default account.");
                return;
            }

            const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@omnifood.com";
            const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const defaultAdmin = new User({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "super_admin",
                phone: "1234567890",
                address: "Omnifood Tower Headquarters"
            });
            await defaultAdmin.save();
            console.log("=========================================");
            console.log("Default Super Admin seeded successfully!");
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
            console.log("=========================================");
        }
    } catch (error) {
        console.error("Failed to seed default Super Admin:", error.message);
    }
}

// Start database and Express listener
async function startServer() {
    await connectDB();
    await migrateUserRoles();
    await seedSuperAdmin();
    await seedFoodCatalog();
    await seedSurgeZones();
    await seedFeatureFlags();
    
    httpServer.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
startServer();
