import express from "express";
import { signup, login, logout, verifyOtp, resendOtp, googleAuth } from "../controllers/authController.mjs";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/google", googleAuth);

export default router;
