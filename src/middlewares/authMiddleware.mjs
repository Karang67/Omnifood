import jwt from "jsonwebtoken";
import User from "../models/User.mjs";

// Middleware to authenticate requests using JWT stored in cookies & check active state
export async function authenticateJWT(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in first." });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check database for active status & bans
        const userObj = await User.findById(decoded.id);
        if (!userObj) {
            return res.status(401).json({ success: false, message: "User account no longer exists." });
        }
        if (userObj.isBanned) {
            res.clearCookie("token");
            return res.status(403).json({ success: false, message: "Your account is currently suspended/banned by administrators." });
        }

        req.user = decoded; // Contains id, email, role, name
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
    }
}

// Middleware to restrict access by user roles (e.g. super_admin, rider, restaurant_owner)
export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
        }
        next();
    };
}
