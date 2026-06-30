import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import CmsConfig from "../models/CmsConfig.mjs";
import Category from "../models/Category.mjs";
import Restaurant from "../models/Restaurant.mjs";
import Coupon from "../models/Coupon.mjs";
import Offer from "../models/Offer.mjs";
import Review from "../models/Review.mjs";
import Blog from "../models/Blog.mjs";
import Faq from "../models/Faq.mjs";
import Banner from "../models/Banner.mjs";
import User from "../models/User.mjs";
import Order from "../models/Order.mjs";
import FoodItem from "../models/FoodItem.mjs";
import { uploadToCloudinary } from "../utils/uploadService.mjs";

// Ensure settings exist and return them
export async function getCmsConfig(req, res) {
    try {
        let config = await CmsConfig.findOne({});
        if (!config) {
            config = new CmsConfig({});
            await config.save();
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update specific configurations (homepage, website, theme, payments, tax, delivery, seo)
export async function updateCmsConfig(req, res) {
    const { section, data } = req.body;
    if (!section || !data) {
        return res.status(400).json({ success: false, message: "Section and data are required." });
    }
    try {
        let config = await CmsConfig.findOne({});
        if (!config) {
            config = new CmsConfig({});
        }
        
        // Merge settings data dynamically
        config[section] = { ...config[section], ...data };
        await config.save();
        res.json({ success: true, message: "Settings updated successfully!", config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// CATEGORY CRUD
export async function getCategories(req, res) {
    try {
        const categories = await Category.find({}).sort({ displayOrder: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createCategory(req, res) {
    const { name, description, displayOrder, visibility } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required." });
    try {
        const imageUrl = req.file ? await uploadToCloudinary(req.file) : "/static/img/1.jpg";
        const category = new Category({
            name,
            description,
            imageUrl,
            displayOrder: parseInt(displayOrder) || 0,
            visibility: visibility === "true" || visibility === true
        });
        await category.save();
        res.json({ success: true, message: "Category created!", category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateCategory(req, res) {
    const { id } = req.params;
    const { name, description, displayOrder, visibility } = req.body;
    try {
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ success: false, message: "Not found." });

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (displayOrder !== undefined) category.displayOrder = parseInt(displayOrder);
        if (visibility !== undefined) category.visibility = visibility === "true" || visibility === true;
        if (req.file) {
            category.imageUrl = await uploadToCloudinary(req.file);
        }
        await category.save();
        res.json({ success: true, message: "Category updated!", category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteCategory(req, res) {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Not found." });
        res.json({ success: true, message: "Category deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// RESTAURANT CRUD
export async function getRestaurants(req, res) {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createRestaurant(req, res) {
    const { name, owner, openingHours, deliveryRadius, minOrder, status } = req.body;
    if (!name || !owner) return res.status(400).json({ success: false, message: "Name and owner are required." });
    try {
        const logoUrl = req.files && req.files.logo ? await uploadToCloudinary(req.files.logo[0]) : "";
        const bannerUrl = req.files && req.files.banner ? await uploadToCloudinary(req.files.banner[0]) : "";

        const restaurant = new Restaurant({
            name,
            owner,
            logoUrl,
            bannerUrl,
            openingHours,
            deliveryRadius: parseFloat(deliveryRadius) || 5,
            minOrder: parseFloat(minOrder) || 10,
            status: status || "Active"
        });
        await restaurant.save();
        res.json({ success: true, message: "Restaurant created!", restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateRestaurant(req, res) {
    const { id } = req.params;
    const { name, owner, openingHours, deliveryRadius, minOrder, status } = req.body;
    try {
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) return res.status(404).json({ success: false, message: "Not found." });

        if (name) restaurant.name = name;
        if (owner) restaurant.owner = owner;
        if (openingHours) restaurant.openingHours = openingHours;
        if (deliveryRadius !== undefined) restaurant.deliveryRadius = parseFloat(deliveryRadius);
        if (minOrder !== undefined) restaurant.minOrder = parseFloat(minOrder);
        if (status) restaurant.status = status;

        if (req.files) {
            if (req.files.logo) restaurant.logoUrl = await uploadToCloudinary(req.files.logo[0]);
            if (req.files.banner) restaurant.bannerUrl = await uploadToCloudinary(req.files.banner[0]);
        }

        await restaurant.save();
        res.json({ success: true, message: "Restaurant updated!", restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteRestaurant(req, res) {
    try {
        const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
        if (!restaurant) return res.status(404).json({ success: false, message: "Not found." });
        res.json({ success: true, message: "Restaurant deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// COUPONS CRUD
export async function getCoupons(req, res) {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createCoupon(req, res) {
    const { code, discount, type, expiryDate, usageLimit, minOrder } = req.body;
    if (!code || !discount || !expiryDate) return res.status(400).json({ success: false, message: "Required fields missing." });
    try {
        const coupon = new Coupon({
            code: code.toUpperCase(),
            discount: parseFloat(discount),
            type: type || "percentage",
            expiryDate: new Date(expiryDate),
            usageLimit: parseInt(usageLimit) || 100,
            minOrder: parseFloat(minOrder) || 15
        });
        await coupon.save();
        res.json({ success: true, message: "Coupon created!", coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateCoupon(req, res) {
    const { id } = req.params;
    const { enabled } = req.body;
    try {
        const coupon = await Coupon.findByIdAndUpdate(id, { enabled }, { new: true });
        res.json({ success: true, message: "Coupon status updated!", coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteCoupon(req, res) {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Coupon deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// OFFERS CRUD
export async function getOffers(req, res) {
    try {
        const offers = await Offer.find({});
        res.json(offers);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createOffer(req, res) {
    const { title, type, details, startDate, endDate } = req.body;
    try {
        const offer = new Offer({
            title,
            type,
            details,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        await offer.save();
        res.json({ success: true, message: "Offer created!", offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteOffer(req, res) {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Offer deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// REVIEWS MANAGER
export async function getReviews(req, res) {
    try {
        const reviews = await Review.find({}).populate("user", "name email").populate("restaurant", "name");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateReviewStatus(req, res) {
    const { id } = req.params;
    const { status, replyText, isSpam } = req.body;
    try {
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ success: false, message: "Not found." });
        if (status) review.status = status;
        if (replyText !== undefined) review.replyText = replyText;
        if (isSpam !== undefined) review.isSpam = isSpam;
        await review.save();
        res.json({ success: true, message: "Review status updated!", review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteReview(req, res) {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Review deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// BLOGS CRUD
export async function getBlogs(req, res) {
    try {
        const blogs = await Blog.find({});
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createBlog(req, res) {
    const { title, content, author, status, categories, tags, metaTitle, metaDescription } = req.body;
    try {
        const imageUrl = req.file ? await uploadToCloudinary(req.file) : "";
        const blog = new Blog({
            title,
            content,
            author,
            imageUrl,
            status: status || "Draft",
            categories: categories ? categories.split(",") : [],
            tags: tags ? tags.split(",") : [],
            seoMeta: {
                metaTitle: metaTitle || title,
                metaDescription: metaDescription || ""
            }
        });
        await blog.save();
        res.json({ success: true, message: "Blog published!", blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteBlog(req, res) {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Blog deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// FAQS CRUD
export async function getFaqs(req, res) {
    try {
        const faqs = await Faq.find({}).sort({ displayOrder: 1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createFaq(req, res) {
    const { question, answer, category, displayOrder } = req.body;
    try {
        const faq = new Faq({
            question,
            answer,
            category,
            displayOrder: parseInt(displayOrder) || 0
        });
        await faq.save();
        res.json({ success: true, message: "FAQ added!", faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteFaq(req, res) {
    try {
        await Faq.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "FAQ deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// BANNERS CRUD
export async function getBanners(req, res) {
    try {
        const banners = await Banner.find({}).sort({ priority: 1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function createBanner(req, res) {
    const { title, subtitle, buttonText, buttonLink, priority, active } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Banner image is required." });
    try {
        const imageUrl = await uploadToCloudinary(req.file);
        const banner = new Banner({
            title,
            subtitle,
            imageUrl,
            buttonText,
            buttonLink,
            priority: parseInt(priority) || 0,
            active: active === "true" || active === true
        });
        await banner.save();
        res.json({ success: true, message: "Banner added!", banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function deleteBanner(req, res) {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Banner deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// USERS & CUSTOMERS MANAGEMENT
export async function getUsersList(req, res) {
    const { role } = req.query;
    try {
        const filter = role ? { role } : {};
        const users = await User.find(filter).select("-password").sort({ date: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateUserBanStatus(req, res) {
    const { id } = req.params;
    const { isBanned } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true }).select("-password");
        res.json({ success: true, message: isBanned ? "User banned!" : "User unbanned!", user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function updateUserWallet(req, res) {
    const { id } = req.params;
    const { amount, action } = req.body; // action: 'credit' or 'debit'
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        const change = parseFloat(amount) || 0;
        if (action === "credit") {
            user.walletBalance = (user.walletBalance || 0) + change;
        } else {
            user.walletBalance = Math.max(0, (user.walletBalance || 0) - change);
        }
        await user.save();
        res.json({ success: true, message: "Wallet updated successfully!", balance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// DATABASE EXPORTS (BACKUPS)
export async function exportCollection(req, res) {
    const { collection } = req.params;
    try {
        let data = [];
        if (collection === "users") {
            data = await User.find({}).select("-password");
        } else if (collection === "orders") {
            data = await Order.find({});
        } else if (collection === "fooditems") {
            data = await FoodItem.find({});
        } else {
            return res.status(400).json({ success: false, message: "Invalid collection." });
        }

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename=omnifood_${collection}_backup.json`);
        res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// COMPREHENSIVE ANALYTICS FOR RECHARTS
export async function getAnalyticsDashboard(req, res) {
    try {
        // Daily orders aggregations
        const dailyOrders = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 15 }
        ]);

        // Categories aggregation
        const popularCategories = await FoodItem.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Delivery performance status mapping
        const statusBreakdown = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // General Stats count
        const totalUsers = await User.countDocuments({});
        const totalOrders = await Order.countDocuments({});
        const totalRevenueResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalOrders,
                totalRevenue,
                activeRiders: await User.countDocuments({ role: "delivery", isOnline: true }),
                totalRiders: await User.countDocuments({ role: "delivery" })
            },
            dailyOrders,
            popularCategories,
            statusBreakdown
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
