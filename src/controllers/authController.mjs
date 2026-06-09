import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.mjs";

export function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

function generateTokenAndSetCookie(res, user) {
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET || "super_secret_omnifood_key_12345",
        { expiresIn: "1d" }
    );
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
}

export async function signup(req, res) {
    const { name, email, password, phone, address, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }
    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already registered." });
        }
        
        const hashedPassword = hashPassword(password);
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || "",
            address: address || "",
            role: role || "customer"
        });
        
        await newUser.save();
        generateTokenAndSetCookie(res, newUser);
        
        res.json({
            success: true,
            message: "Account created successfully!",
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, address: newUser.address }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }
        
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password." });
        }
        
        generateTokenAndSetCookie(res, user);
        
        res.json({
            success: true,
            message: "Login successful!",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function logout(req, res) {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully!" });
}
