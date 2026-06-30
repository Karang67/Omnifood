import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dns from "dns";
import User from "../models/User.mjs";
import PendingUser from "../models/PendingUser.mjs";
import { sendOtpEmail } from "../utils/emailService.mjs";

export function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

// Check if email domain has valid MX records
async function isEmailDomainValid(email) {
    const domain = email.split("@")[1];
    if (!domain) return false;
    try {
        const mxRecords = await dns.promises.resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch (error) {
        console.warn(`MX lookup failed for ${domain}:`, error.message);
        return false;
    }
}

export async function signup(req, res) {
    const { name, email, password, phone, address, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }
    try {
        // 1. Perform DNS MX record check to verify email legitimacy
        const isDomainValid = await isEmailDomainValid(email.trim());
        if (!isDomainValid) {
            return res.status(400).json({ 
                success: false, 
                message: "Please enter a valid email address with a deliverable domain." 
            });
        }

        // 2. Check if email already registered as an active user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already registered." });
        }

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const passwordHash = hashPassword(password);

        // Upsert: replace any existing pending verification for this email
        await PendingUser.findOneAndUpdate(
            { email: email.toLowerCase() },
            { name, email: email.toLowerCase(), passwordHash, phone: phone || "", address: address || "", role: role || "customer", otp, otpExpiry },
            { upsert: true, new: true }
        );

        // Send OTP email
        await sendOtpEmail(email, name, otp);

        res.json({
            success: true,
            requiresVerification: true,
            message: "Verification code sent to your email!",
            email: email.toLowerCase()
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
}

export async function verifyOtp(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }
    try {
        const pending = await PendingUser.findOne({ email: email.toLowerCase() });

        if (!pending) {
            return res.status(400).json({ success: false, message: "No pending verification found. Please sign up again." });
        }
        if (new Date() > pending.otpExpiry) {
            await PendingUser.deleteOne({ email: email.toLowerCase() });
            return res.status(400).json({ success: false, message: "OTP has expired. Please sign up again." });
        }
        if (pending.otp !== otp.trim()) {
            return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
        }

        // Create the real user
        const newUser = new User({
            name: pending.name,
            email: pending.email,
            password: pending.passwordHash,
            phone: pending.phone,
            address: pending.address,
            role: pending.role
        });
        await newUser.save();

        // Clean up pending record
        await PendingUser.deleteOne({ email: email.toLowerCase() });

        generateTokenAndSetCookie(res, newUser);

        res.json({
            success: true,
            message: "Email verified! Account created successfully.",
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, address: newUser.address }
        });
    } catch (error) {
        console.error("OTP verification error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
}

export async function resendOtp(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }
    try {
        const pending = await PendingUser.findOne({ email: email.toLowerCase() });
        if (!pending) {
            return res.status(400).json({ success: false, message: "No pending verification found. Please sign up again." });
        }

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        pending.otp = otp;
        pending.otpExpiry = otpExpiry;
        await pending.save();

        await sendOtpEmail(pending.email, pending.name, otp);

        res.json({ success: true, message: "A new verification code has been sent to your email." });
    } catch (error) {
        console.error("Resend OTP error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
}

export async function googleAuth(req, res) {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({ success: false, message: "Google credential token is required." });
    }
    try {
        // Verify token with Google API directly (dependency-free)
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        const payload = await response.json();

        if (payload.error || !payload.email) {
            return res.status(400).json({ success: false, message: "Invalid Google credential token." });
        }

        const email = payload.email.toLowerCase();
        let user = await User.findOne({ email });

        if (!user) {
            // Sign up a new user automatically
            const randomPassword = Math.random().toString(36).slice(-16);
            const passwordHash = hashPassword(randomPassword);

            user = new User({
                name: payload.name || payload.email.split("@")[0],
                email,
                password: passwordHash,
                role: "customer"
            });
            await user.save();
        }

        generateTokenAndSetCookie(res, user);

        res.json({
            success: true,
            message: "Google Auth successful!",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address }
        });
    } catch (error) {
        console.error("Google Auth error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong during Google Auth. Please try again." });
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
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }
}

export async function logout(req, res) {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully!" });
}
