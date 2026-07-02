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
    getCustomerOrders,
    getRestaurantOrders,
    acceptRestaurantOrder
} from "../controllers/orderController.mjs";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware.mjs";
import { checkFeatureEnabled, checkApiAccess } from "../middlewares/featureMiddleware.mjs";

const router = express.Router();

// 1. Public Customer APIs
router.get("/api/food", checkFeatureEnabled('customer-menu'), checkApiAccess('customer-menu'), getFoodItems);
router.post("/api/order/place", checkFeatureEnabled('customer-checkout'), checkApiAccess('customer-checkout'), placeOrder);
router.get("/api/order/:orderId", getOrderById);
router.get("/api/orders/customer/:email", authenticateJWT, getCustomerOrders);

// 1b. Restaurant Owner APIs
router.get("/api/restaurant/orders", authenticateJWT, authorizeRoles("restaurant_owner"), getRestaurantOrders);

// 2. Delivery Partner / Rider APIs (requires "rider", "restaurant_owner" or "super_admin" roles)
router.get("/api/delivery/orders/:partnerId", authenticateJWT, authorizeRoles("rider", "super_admin"), getPartnerOrders);
router.post("/api/delivery/order/status", authenticateJWT, authorizeRoles("rider", "super_admin"), updateOrderStatus);
router.post("/api/delivery/order/accept", authenticateJWT, authorizeRoles("rider", "super_admin"), acceptRiderOrder);
router.post("/api/delivery/order/reject", authenticateJWT, authorizeRoles("rider", "super_admin"), rejectRiderOrder);
router.post("/api/delivery/onboard", authenticateJWT, authorizeRoles("rider", "super_admin"), onboardRider);
router.post("/api/delivery/availability", authenticateJWT, authorizeRoles("rider", "super_admin"), toggleRiderAvailability);
router.post("/api/delivery/location", authenticateJWT, authorizeRoles("rider", "super_admin"), updateRiderLocation);
router.post("/api/delivery/cashout", authenticateJWT, authorizeRoles("rider", "super_admin"), cashOutWallet);
router.post("/api/delivery/ticket/create", authenticateJWT, authorizeRoles("rider", "super_admin"), createSupportTicket);

// Restaurant owner APIs
router.post("/api/restaurant/order/accept", authenticateJWT, authorizeRoles("restaurant_owner"), acceptRestaurantOrder);
router.post("/api/restaurant/order/assign", authenticateJWT, authorizeRoles("restaurant_owner", "super_admin"), assignDeliveryPartner);

// 3. Shared Admin/Rider APIs
router.get("/api/admin/delivery-partners", authenticateJWT, authorizeRoles("super_admin", "rider", "restaurant_owner"), getDeliveryPartners);
router.get("/api/admin/tickets", authenticateJWT, authorizeRoles("super_admin", "rider"), getSupportTickets);

// 4. Admin Command Dashboard APIs (strictly requires "super_admin" role)
router.post("/api/admin/food/add", authenticateJWT, authorizeRoles("super_admin"), addFoodItem);
router.post("/api/admin/food/delete/:id", authenticateJWT, authorizeRoles("super_admin"), deleteFoodItem);
router.get("/api/admin/orders", authenticateJWT, authorizeRoles("super_admin"), getAdminOrders);
router.post("/api/admin/order/assign", authenticateJWT, authorizeRoles("super_admin"), assignDeliveryPartner);
router.post("/api/admin/delivery/approve", authenticateJWT, authorizeRoles("super_admin"), approveRiderOnboarding);
router.post("/api/admin/delivery/suspend", authenticateJWT, authorizeRoles("super_admin"), toggleRiderSuspension);
router.post("/api/admin/auto-assign/toggle", authenticateJWT, authorizeRoles("super_admin"), toggleAutoAssignment);
router.get("/api/admin/auto-assign/status", authenticateJWT, authorizeRoles("super_admin"), getAutoAssignmentStatus);
router.get("/api/admin/surge", authenticateJWT, authorizeRoles("super_admin"), getSurgeZones);
router.post("/api/admin/surge/update", authenticateJWT, authorizeRoles("super_admin"), updateSurgeZone);
router.post("/api/admin/ticket/reply", authenticateJWT, authorizeRoles("super_admin"), replySupportTicket);
router.get("/api/admin/analytics", authenticateJWT, authorizeRoles("super_admin"), getFleetAnalytics);

// 5. Legacy Contact Form Submit Route (Public)
router.post("/contact", submitLegacyContact);

export default router;
