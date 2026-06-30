import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.mjs";
import FoodItem from "./src/models/FoodItem.mjs";
import SurgeZone from "./src/models/SurgeZone.mjs";
import viewRoutes from "./src/routes/viewRoutes.mjs";
import authRoutes from "./src/routes/authRoutes.mjs";
import apiRoutes from "./src/routes/apiRoutes.mjs";

// Derive path variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express App
const app = express();
const port = process.env.PORT || 9000;

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
    res.setHeader("Content-Security-Policy", "default-src 'self' https://unpkg.com https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https://unpkg.com https://*.openstreetmap.org; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; font-src 'self' https://unpkg.com https://fonts.gstatic.com; connect-src 'self'");
    next();
});

// Middlewares
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'client/dist')));

// Mount MVC Routers
app.use("/api/auth", authRoutes); // Authentication APIs
app.use("/", apiRoutes);          // Main Order and Admin APIs
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

// Start database and Express listener
async function startServer() {
    await connectDB();
    await seedFoodCatalog();
    await seedSurgeZones();
    
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
startServer();
