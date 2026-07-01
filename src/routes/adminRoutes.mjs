import express from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.mjs";
import upload from "../utils/uploadService.mjs";
import {
    getCmsConfig,
    updateCmsConfig,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getOffers,
    createOffer,
    deleteOffer,
    getReviews,
    updateReviewStatus,
    deleteReview,
    getBlogs,
    createBlog,
    deleteBlog,
    getFaqs,
    createFaq,
    deleteFaq,
    getBanners,
    createBanner,
    deleteBanner,
    getUsersList,
    updateUserBanStatus,
    updateUserWallet,
    updateUser,
    deleteUser,
    exportCollection,
    getAnalyticsDashboard
} from "../controllers/adminCmsController.mjs";
import {
    getFeatureFlags,
    updateFeatureFlag,
    bulkAction,
    getFeatureAuditLogs,
    getPublicFeatureFlags
} from "../controllers/featureController.mjs";

const router = express.Router();

// Public configurations (for loading landing page contents)
router.get("/api/cms/config", getCmsConfig);

// Protected admin paths
const cmsAuth = [authenticateJWT, authorizeRoles("super_admin")];

// Banners
router.get("/api/admin/banners", cmsAuth, getBanners);
router.post("/api/admin/banners", ...cmsAuth, upload.single("image"), createBanner);
router.delete("/api/admin/banners/:id", cmsAuth, deleteBanner);

// Categories
router.get("/api/admin/categories", getCategories);
router.post("/api/admin/categories", ...cmsAuth, upload.single("image"), createCategory);
router.put("/api/admin/categories/:id", ...cmsAuth, upload.single("image"), updateCategory);
router.delete("/api/admin/categories/:id", cmsAuth, deleteCategory);

// Restaurants
router.get("/api/admin/restaurants", getRestaurants);
router.post("/api/admin/restaurants", ...cmsAuth, upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]), createRestaurant);
router.put("/api/admin/restaurants/:id", ...cmsAuth, upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]), updateRestaurant);
router.delete("/api/admin/restaurants/:id", cmsAuth, deleteRestaurant);

// Coupons
router.get("/api/admin/coupons", cmsAuth, getCoupons);
router.post("/api/admin/coupons", cmsAuth, createCoupon);
router.put("/api/admin/coupons/:id", cmsAuth, updateCoupon);
router.delete("/api/admin/coupons/:id", cmsAuth, deleteCoupon);

// Offers
router.get("/api/admin/offers", getOffers);
router.post("/api/admin/offers", cmsAuth, createOffer);
router.delete("/api/admin/offers/:id", cmsAuth, deleteOffer);

// Reviews
router.get("/api/admin/reviews", getReviews);
router.put("/api/admin/reviews/:id", cmsAuth, updateReviewStatus);
router.delete("/api/admin/reviews/:id", cmsAuth, deleteReview);

// Blogs
router.get("/api/admin/blogs", getBlogs);
router.post("/api/admin/blogs", ...cmsAuth, upload.single("image"), createBlog);
router.delete("/api/admin/blogs/:id", cmsAuth, deleteBlog);

// FAQs
router.get("/api/admin/faqs", getFaqs);
router.post("/api/admin/faqs", cmsAuth, createFaq);
router.delete("/api/admin/faqs/:id", cmsAuth, deleteFaq);

// Users management
router.get("/api/admin/users", cmsAuth, getUsersList);
router.put("/api/admin/users/ban/:id", cmsAuth, updateUserBanStatus);
router.put("/api/admin/users/wallet/:id", cmsAuth, updateUserWallet);
router.put("/api/admin/users/update/:id", cmsAuth, updateUser);
router.delete("/api/admin/users/:id", cmsAuth, deleteUser);

// Settings
router.put("/api/admin/settings", cmsAuth, updateCmsConfig);

// Database backup downloads
router.get("/api/admin/backup/:collection", cmsAuth, exportCollection);

// Comprehensive Recharts analytics dashboard
router.get("/api/admin/dashboard-analytics", cmsAuth, getAnalyticsDashboard);

// Feature flag management
router.get("/api/admin/features", cmsAuth, getFeatureFlags);
router.put("/api/admin/features/:slug", cmsAuth, updateFeatureFlag);
router.post("/api/admin/features/bulk", cmsAuth, bulkAction);
router.get("/api/admin/features/audit", cmsAuth, getFeatureAuditLogs);
router.get("/api/features/public", getPublicFeatureFlags);

export default router;
