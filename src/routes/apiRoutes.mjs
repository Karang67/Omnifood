import express from "express";
import { getFoodItems, addFoodItem, deleteFoodItem } from "../controllers/foodController.mjs";
import { 
    placeOrder, 
    getOrderById, 
    getAdminOrders, 
    getDeliveryPartners, 
    assignDeliveryPartner, 
    getPartnerOrders, 
    updateOrderStatus,
    acceptRiderOrder,
    rejectRiderOrder,
    onboardRider,
    toggleRiderAvailability,
    updateRiderLocation,
    cashOutWallet,
    createSupportTicket,
    getSupportTickets,
    replySupportTicket,
    approveRiderOnboarding,
    toggleRiderSuspension,
    toggleAutoAssignment,
    getAutoAssignmentStatus,
    getSurgeZones,
    updateSurgeZone,
    getFleetAnalytics,
    submitLegacyContact,
    getCustomerOrders
} from "../controllers/orderController.mjs";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

// 1. Public Customer APIs
router.get("/api/food", getFoodItems);
router.post("/api/order/place", placeOrder);
router.get("/api/order/:orderId", getOrderById);
router.get("/api/orders/customer/:email", authenticateJWT, getCustomerOrders);

// 2. Delivery Partner / Rider APIs (requires "delivery" or "admin" roles)
router.get("/api/delivery/orders/:partnerId", authenticateJWT, authorizeRoles("delivery", "admin"), getPartnerOrders);
router.post("/api/delivery/order/status", authenticateJWT, authorizeRoles("delivery", "admin"), updateOrderStatus);
router.post("/api/delivery/order/accept", authenticateJWT, authorizeRoles("delivery", "admin"), acceptRiderOrder);
router.post("/api/delivery/order/reject", authenticateJWT, authorizeRoles("delivery", "admin"), rejectRiderOrder);
router.post("/api/delivery/onboard", authenticateJWT, authorizeRoles("delivery", "admin"), onboardRider);
router.post("/api/delivery/availability", authenticateJWT, authorizeRoles("delivery", "admin"), toggleRiderAvailability);
router.post("/api/delivery/location", authenticateJWT, authorizeRoles("delivery", "admin"), updateRiderLocation);
router.post("/api/delivery/cashout", authenticateJWT, authorizeRoles("delivery", "admin"), cashOutWallet);
router.post("/api/delivery/ticket/create", authenticateJWT, authorizeRoles("delivery", "admin"), createSupportTicket);

// 3. Shared Admin/Delivery APIs
router.get("/api/admin/delivery-partners", authenticateJWT, authorizeRoles("admin", "delivery"), getDeliveryPartners);
router.get("/api/admin/tickets", authenticateJWT, authorizeRoles("admin", "delivery"), getSupportTickets);

// 4. Admin Command Dashboard APIs (strictly requires "admin" role)
router.post("/api/admin/food/add", authenticateJWT, authorizeRoles("admin"), addFoodItem);
router.post("/api/admin/food/delete/:id", authenticateJWT, authorizeRoles("admin"), deleteFoodItem);
router.get("/api/admin/orders", authenticateJWT, authorizeRoles("admin"), getAdminOrders);
router.post("/api/admin/order/assign", authenticateJWT, authorizeRoles("admin"), assignDeliveryPartner);
router.post("/api/admin/delivery/approve", authenticateJWT, authorizeRoles("admin"), approveRiderOnboarding);
router.post("/api/admin/delivery/suspend", authenticateJWT, authorizeRoles("admin"), toggleRiderSuspension);
router.post("/api/admin/auto-assign/toggle", authenticateJWT, authorizeRoles("admin"), toggleAutoAssignment);
router.get("/api/admin/auto-assign/status", authenticateJWT, authorizeRoles("admin"), getAutoAssignmentStatus);
router.get("/api/admin/surge", authenticateJWT, authorizeRoles("admin"), getSurgeZones);
router.post("/api/admin/surge/update", authenticateJWT, authorizeRoles("admin"), updateSurgeZone);
router.post("/api/admin/ticket/reply", authenticateJWT, authorizeRoles("admin"), replySupportTicket);
router.get("/api/admin/analytics", authenticateJWT, authorizeRoles("admin"), getFleetAnalytics);

// 5. Legacy Contact Form Submit Route (Public)
router.post("/contact", submitLegacyContact);

export default router;
