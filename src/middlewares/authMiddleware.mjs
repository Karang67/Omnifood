import jwt from "jsonwebtoken";

// Middleware to authenticate requests using JWT stored in cookies
export function authenticateJWT(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in first." });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id, email, role, name
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
    }
}

// Middleware to restrict access by user roles (e.g. admin, delivery)
export function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
        }
        next();
    };
}
