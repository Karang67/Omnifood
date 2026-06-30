import express from "express";
import { signup, login, logout, verifyOtp, resendOtp } from "../controllers/authController.mjs";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;
