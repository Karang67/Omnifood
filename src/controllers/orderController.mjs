import mongoose from "mongoose";
import Order from "../models/Order.mjs";
import User from "../models/User.mjs";
import Contact from "../models/Contact.mjs";
import Ticket from "../models/Ticket.mjs";
import SurgeZone from "../models/SurgeZone.mjs";

// In-memory auto-assignment toggle status
let autoAssignmentEnabled = false;

// Global Rejection Counter for analytics simulation
let globalAcceptedCount = 12;
let globalRejectedCount = 3;

// Helper to calculate geodesic distance in km between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; 
    return parseFloat(d.toFixed(2));
}

// 1. CUSTOMER: Place Order with Logistics Geolocation & Dynamic Payout
export async function placeOrder(req, res) {
    const { customerName, email, phone, address, items, totalAmount, paymentMethod, paymentStatus } = req.body;
    if (!customerName || !email || !phone || !address || !items || !totalAmount) {
        return res.status(400).json({ success: false, message: "All order details are required." });
    }
    try {
        // Base shop location: Downtown/Midtown NYC center
        const shopLat = 40.7128;
        const shopLng = -74.0060;
        
        // Randomize customer location in NYC (offset -0.04 to +0.04)
        const customerLat = shopLat + (Math.random() - 0.5) * 0.08;
        const customerLng = shopLng + (Math.random() - 0.5) * 0.08;
        
        const distance = calculateDistance(shopLat, shopLng, customerLat, customerLng);
        
        // Query active surge pricing zones
        let surgeMultiplier = 1.0;
        const activeSurges = await SurgeZone.find({ active: true });
        if (activeSurges.length > 0) {
            // Find maximum active surge multiplier
            surgeMultiplier = Math.max(...activeSurges.map(z => z.multiplier));
        }
        
        // Payout pricing: $2.50 base + $1.80 per km, scaled by surge multiplier
        const deliveryPayout = parseFloat(( (2.50 + (1.80 * distance)) * surgeMultiplier ).toFixed(2));
        
        // Simulate customer tipping rate (10% of order value, min $2)
        const parsedTotal = parseFloat(totalAmount);
        const tipAmount = parseFloat(Math.max(2.00, parsedTotal * 0.10).toFixed(2));
        
        const newOrder = new Order({
            customerName,
            email,
            phone,
            address,
            items,
            totalAmount: parsedTotal,
            status: "Placed",
            distance,
            deliveryPayout,
            surgeMultiplier,
            tipAmount,
            coords: {
                shopLat,
                shopLng,
                customerLat,
                customerLng
            },
            paymentMethod: paymentMethod || "COD",
            paymentStatus: paymentStatus || "Pending"
        });
        
        // If Auto-Assignment dispatch algorithm is enabled, search for nearest driver
        if (autoAssignmentEnabled) {
            const availableRider = await User.findOne({
                role: "delivery",
                isOnline: true,
                onboardingStatus: "Approved"
            });
            
            if (availableRider) {
                newOrder.deliveryPartner = availableRider._id;
                newOrder.status = "Preparing"; // Paired immediately
            }
        }
        
        await newOrder.save();
        res.json({ 
            success: true, 
            message: "Order placed successfully!", 
            orderId: newOrder._id,
            distance,
            deliveryPayout,
            surgeMultiplier
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 2. GET Order by ID (Customer order tracker)
export async function getOrderById(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
        return res.status(400).json({ success: false, message: "Invalid order ID format." });
    }
    try {
        const order = await Order.findById(req.params.orderId).populate("deliveryPartner", "name email phone lat lng speed");
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        res.json(order);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 3. ADMIN: Get Orders with Full Details
export async function getAdminOrders(req, res) {
    try {
        const orders = await Order.find({}).populate("deliveryPartner", "name email phone isOnline onboardingStatus").sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 4. ADMIN: Get Delivery Partners with Full Onboarding Status
export async function getDeliveryPartners(req, res) {
    try {
        const partners = await User.find({ role: "delivery" }, "name email phone isOnline onboardingStatus license vehicle bankDetails walletBase walletTips walletIncentives lat lng speed");
        res.json(partners);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 5. ADMIN: Manually Assign Order
export async function assignDeliveryPartner(req, res) {
    const { orderId, partnerId } = req.body;
    if (!orderId || !partnerId) {
        return res.status(400).json({ success: false, message: "Order ID and Delivery Partner ID are required." });
    }
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        
        order.deliveryPartner = partnerId;
        order.status = "Preparing";
        await order.save();
        
        globalAcceptedCount++; // Simulation increment
        
        res.json({ success: true, message: "Rider assigned and order status updated to Preparing!", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 6. RIDER: Get Assigned Tasks
export async function getPartnerOrders(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.partnerId)) {
        return res.status(400).json({ success: false, message: "Invalid partner ID format." });
    }
    try {
        const orders = await Order.find({ deliveryPartner: req.params.partnerId }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 7. RIDER: Accept Order Pop-up Alert
export async function acceptRiderOrder(req, res) {
    const { orderId, partnerId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(partnerId)) {
        return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        
        order.deliveryPartner = partnerId;
        order.status = "Preparing";
        await order.save();
        
        globalAcceptedCount++;
        res.json({ success: true, message: "Order accepted successfully!", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 8. RIDER: Reject Order Pop-up (Simulates Fleet rejection analytics)
export async function rejectRiderOrder(req, res) {
    try {
        globalRejectedCount++;
        res.json({ success: true, message: "Order rejected. Recalculating fleet routing." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 9. RIDER/ADMIN: Update Order Status (Preparing -> Out for Delivery -> Delivered)
export async function updateOrderStatus(req, res) {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
        return res.status(400).json({ success: false, message: "Order ID and status are required." });
    }
    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        
        order.status = status;
        await order.save();
        
        // If order is completed (Delivered), credit the rider's wallet
        if (status === "Delivered" && order.deliveryPartner) {
            const rider = await User.findById(order.deliveryPartner);
            if (rider) {
                rider.walletBase += order.deliveryPayout;
                rider.walletTips += order.tipAmount;
                rider.walletIncentives += 1.50; // $1.50 delivery loyalty incentive
                await rider.save();
            }
        }
        
        res.json({ success: true, message: `Order status successfully updated to ${status}!`, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 10. RIDER: Document Upload Portal Onboarding
export async function onboardRider(req, res) {
    const { partnerId, license, vehicle, bankDetails } = req.body;
    if (!partnerId || !license || !vehicle || !bankDetails) {
        return res.status(400).json({ success: false, message: "All document registrations are required." });
    }
    try {
        const rider = await User.findById(partnerId);
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found." });
        
        rider.license = license;
        rider.vehicle = vehicle;
        rider.bankDetails = bankDetails;
        rider.onboardingStatus = "Pending"; // Awaits admin check
        await rider.save();
        
        res.json({ success: true, message: "Documents uploaded successfully! Review pending.", rider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 11. RIDER: Availability Toggle (Online/Offline)
export async function toggleRiderAvailability(req, res) {
    const { partnerId, isOnline } = req.body;
    if (!partnerId) return res.status(400).json({ success: false, message: "Partner ID is required." });
    try {
        const rider = await User.findById(partnerId);
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found." });
        
        // If driver is not approved yet, do not allow going online
        if (isOnline && rider.onboardingStatus !== "Approved") {
            return res.status(400).json({ success: false, message: "Please complete and submit onboarding details for verification before going online." });
        }
        
        rider.isOnline = isOnline;
        await rider.save();
        res.json({ success: true, message: `Rider availability toggled to ${isOnline ? "Online" : "Offline"}!`, isOnline });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 12. RIDER: Update GPS Location coords & speed
export async function updateRiderLocation(req, res) {
    const { partnerId, lat, lng, speed } = req.body;
    try {
        const rider = await User.findById(partnerId);
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found." });
        
        rider.lat = lat;
        rider.lng = lng;
        rider.speed = speed || 0;
        await rider.save();
        
        res.json({ success: true, message: "Rider location successfully updated." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 13. RIDER: Cash Out Wallets
export async function cashOutWallet(req, res) {
    const { partnerId } = req.body;
    try {
        const rider = await User.findById(partnerId);
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found." });
        
        rider.walletBase = 0;
        rider.walletTips = 0;
        rider.walletIncentives = 0;
        await rider.save();
        
        res.json({ success: true, message: "Wallets successfully cashed out to bank details!", rider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 14. SUPPORT: Submit Ticket
export async function createSupportTicket(req, res) {
    const { userId, userName, userRole, subject, message } = req.body;
    try {
        const ticket = new Ticket({ userId, userName, userRole, subject, message });
        await ticket.save();
        res.json({ success: true, message: "Support ticket registered successfully!", ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 15. SUPPORT: Fetch Support Tickets
export async function getSupportTickets(req, res) {
    try {
        const tickets = await Ticket.find({}).sort({ date: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 16. SUPPORT: Reply Support Ticket
export async function replySupportTicket(req, res) {
    const { ticketId, reply } = req.body;
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found." });
        
        ticket.reply = reply;
        ticket.status = "Resolved";
        await ticket.save();
        res.json({ success: true, message: "Reply sent and ticket resolved!", ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 17. ADMIN: Approve Onboarding
export async function approveRiderOnboarding(req, res) {
    const { partnerId } = req.body;
    try {
        const rider = await User.findById(partnerId);
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found." });
        
        rider.onboardingStatus = "Approved";
        await rider.save();
        res.json({ success: true, message: "Rider onboarding approved successfully!", rider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 18. ADMIN: Suspend/Unsuspend Fleet Rider
export async function toggleRiderSuspension(req, res) {
    const { partnerId } = req.body;
    try {
        const rider = await User.findById(partnerId);
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found." });
        
        rider.onboardingStatus = (rider.onboardingStatus === "Suspended") ? "Approved" : "Suspended";
        rider.isOnline = false; // Disconnect them
        await rider.save();
        
        res.json({ success: true, message: `Rider onboarding state updated to ${rider.onboardingStatus}!`, rider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 19. ADMIN: Toggle Auto-Assignment status
export async function toggleAutoAssignment(req, res) {
    try {
        autoAssignmentEnabled = !autoAssignmentEnabled;
        res.json({ success: true, autoAssignmentEnabled });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Auto Assignment configuration status
export async function getAutoAssignmentStatus(req, res) {
    res.json({ autoAssignmentEnabled });
}

// 20. SURGE: Fetch Surges
export async function getSurgeZones(req, res) {
    try {
        const surges = await SurgeZone.find({});
        res.json(surges);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// SURGE: Config Surge zone values
export async function updateSurgeZone(req, res) {
    const { zoneName, multiplier, active } = req.body;
    try {
        let zone = await SurgeZone.findOne({ zoneName });
        if (!zone) {
            zone = new SurgeZone({ zoneName, multiplier, active });
        } else {
            zone.multiplier = parseFloat(multiplier);
            zone.active = active;
        }
        await zone.save();
        res.json({ success: true, message: "Surge zone multiplier successfully configured!", zone });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 21. ANALYTICS: Calculate Chart.js Logistics Insights
export async function getFleetAnalytics(req, res) {
    try {
        // Average Delivery Speeds (derived from distance / simulated time, say random base 15-28 mins)
        const speeds = [21.5, 19.2, 23.4, 25.1, 18.7, 22.0, 20.3];
        
        // Satisfaction ratings
        const ratings = {
            fiveStar: 45,
            fourStar: 18,
            threeStar: 4,
            twoStar: 1,
            oneStar: 0
        };
        
        res.json({
            speeds,
            accepted: globalAcceptedCount,
            rejected: globalRejectedCount,
            ratings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// 22. Legacy contact form submission saving
export async function submitLegacyContact(req, res) {
    const { name, email, phone, address, desc } = req.body;
    const contactData = new Contact({ name, email, phone, address, desc });
    try {
        await contactData.save();
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thank You - Omnifood</title>
                <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;1,300&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        background-image: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("/static/img/hero.jpg");
                        background-size: cover;
                        background-position: center;
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: #fff;
                        font-family: 'Lato', 'Arial', sans-serif;
                    }
                    .success-container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(15px);
                        -webkit-backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        padding: 50px;
                        border-radius: 15px;
                        text-align: center;
                        max-width: 600px;
                        width: 90%;
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    }
                    h1 { color: #e67e22; font-size: 2.2rem; margin-bottom: 20px; font-weight: 300; text-transform: uppercase; letter-spacing: 1px; }
                    p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px; color: #ddd; font-weight: 300; }
                    .btn-back {
                        display: inline-block;
                        background-color: #e67e22;
                        color: #fff !important;
                        padding: 12px 35px;
                        border-radius: 200px;
                        text-decoration: none;
                        font-weight: 300;
                        border: 1px solid #e67e22;
                        transition: background-color 0.2s, color 0.2s, border-color 0.2s;
                        text-transform: uppercase;
                        font-size: 90%;
                    }
                    .btn-back:hover { background-color: #cf6d17; border-color: #cf6d17; }
                </style>
            </head>
            <body>
                <div class="success-container">
                    <h1>Thank you for your submission, ${name}!</h1>
                    <p>We have successfully received your information and saved it to our database. Our specialists will reach out to you shortly.</p>
                    <a href="/" class="btn-back">Go back to the home page</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Error saving to the database:", error.message);
        res.status(500).send(`
            <h1>Something went wrong. Please try again.</h1>
            <p>${error.message}</p>
        `);
    }
}

// 23. CUSTOMER: Fetch orders placed by this customer (email match)
export async function getCustomerOrders(req, res) {
    try {
        const orders = await Order.find({ email: req.params.email }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
