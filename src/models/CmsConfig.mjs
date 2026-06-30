import mongoose from "mongoose";

const cmsConfigSchema = new mongoose.Schema({
    // Homepage Settings
    homepage: {
        hero: {
            heading: { type: String, default: "Omnifood" },
            subheading: { type: String, default: "Super healthy, gourmet meals delivered to your doorstep." },
            description: { type: String, default: "Healthy eating, simplified. We cook delicious, organic meals and deliver them in under 20 minutes." },
            ctaText: { type: String, default: "Start Eating Healthy" },
            imageUrl: { type: String, default: "/static/img/hero.jpg" }
        },
        contact: {
            phone: { type: String, default: "555-0199" },
            email: { type: String, default: "hello@omnifood.com" },
            address: { type: String, default: "623 Harrison St., 2nd Floor, San Francisco, CA 94107" }
        },
        socials: {
            facebook: { type: String, default: "#" },
            instagram: { type: String, default: "#" },
            twitter: { type: String, default: "#" }
        },
        showHero: { type: Boolean, default: true },
        showFeatures: { type: Boolean, default: true },
        showSignatureMeals: { type: Boolean, default: true },
        showHowItWorks: { type: Boolean, default: true },
        showCities: { type: Boolean, default: true },
        showTestimonials: { type: Boolean, default: true },
        showPlans: { type: Boolean, default: true },
        showContactForm: { type: Boolean, default: true },
        featuresList: [
            {
                title: { type: String },
                description: { type: String },
                icon: { type: String, default: "ion-ios-infinite-outline" },
                isActive: { type: Boolean, default: true }
            }
        ],
        stepsList: [
            {
                stepNumber: { type: Number },
                title: { type: String },
                description: { type: String },
                isActive: { type: Boolean, default: true }
            }
        ],
        citiesList: [
            {
                name: { type: String },
                image: { type: String, default: "/static/img/lisbon-3.jpg" },
                eaters: { type: String },
                chefs: { type: String },
                twitter: { type: String },
                isActive: { type: Boolean, default: true }
            }
        ],
        testimonialsList: [
            {
                name: { type: String },
                role: { type: String },
                quote: { type: String },
                rating: { type: Number, default: 5 },
                imageUrl: { type: String, default: "/static/img/customer-1.jpg" },
                isActive: { type: Boolean, default: true }
            }
        ],
        plansList: [
            {
                name: { type: String },
                price: { type: String },
                priceMeal: { type: String },
                features: [{ type: String }],
                popular: { type: Boolean, default: false },
                isActive: { type: Boolean, default: true }
            }
        ]
    },
    // Website Settings
    website: {
        name: { type: String, default: "Omnifood" },
        logoUrl: { type: String, default: "/static/img/logo.png" },
        faviconUrl: { type: String, default: "/static/img/logo.png" },
        currency: { type: String, default: "USD" },
        timezone: { type: String, default: "America/New_York" },
        maintenanceMode: { type: Boolean, default: false },
        disableMenuPage: { type: Boolean, default: false },
        disableCartPage: { type: Boolean, default: false },
        disableCheckoutPage: { type: Boolean, default: false }
    },
    // Theme Settings
    theme: {
        primaryColor: { type: String, default: "#e23744" },
        secondaryColor: { type: String, default: "#cb202d" },
        fontFamily: { type: String, default: "Inter" },
        darkModeEnabled: { type: Boolean, default: false }
    },
    // SEO Settings
    seo: {
        metaTitle: { type: String, default: "Omnifood - Premium & Healthy Food Delivery Service" },
        metaDescription: { type: String, default: "Healthy eating, simplified." },
        keywords: { type: String, default: "food, delivery, healthy, organic, meal prep" }
    },
    // Payment Settings
    payment: {
        stripeEnabled: { type: Boolean, default: true },
        razorpayEnabled: { type: Boolean, default: false },
        codEnabled: { type: Boolean, default: true },
        walletEnabled: { type: Boolean, default: true },
        upiEnabled: { type: Boolean, default: true }
    },
    // Delivery Settings
    delivery: {
        charge: { type: Number, default: 4.99 },
        freeLimit: { type: Number, default: 40 },
        estTime: { type: Number, default: 20 },
        minOrder: { type: Number, default: 12 },
        maxRadius: { type: Number, default: 10 } // in km
    },
    // Tax Settings
    tax: {
        gst: { type: Number, default: 5 }, // in percentage
        packaging: { type: Number, default: 1.50 }, // flat
        serviceCharge: { type: Number, default: 2.00 } // flat
    }
}, { timestamps: true });

export default mongoose.model("CmsConfig", cmsConfigSchema);
