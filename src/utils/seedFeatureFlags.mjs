import FeatureFlag from '../models/FeatureFlag.mjs';

const featureDefinitions = [
  { name: 'Hero Section', slug: 'home-hero', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 1 },
  { name: 'Hero Search Bar', slug: 'hero-search-bar', module: 'Home', parent: 'home-hero', enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 2 },
  { name: 'Hero CTA Buttons', slug: 'hero-cta-buttons', module: 'Home', parent: 'home-hero', enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 3 },
  { name: 'Hero Badges', slug: 'hero-badges', module: 'Home', parent: 'home-hero', enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 4 },
  { name: 'Features Section', slug: 'home-features', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 5 },
  { name: 'Meal Carousel', slug: 'home-meals', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 6 },
  { name: 'How It Works', slug: 'home-how-it-works', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 7 },
  { name: 'Cities', slug: 'home-cities', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 8 },
  { name: 'Testimonials', slug: 'home-testimonials', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 9 },
  { name: 'Plans Section', slug: 'home-plans', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 10 },
  { name: 'Contact Form', slug: 'home-contact', module: 'Home', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 11 },
  { name: 'Login Page', slug: 'auth-login', module: 'Authentication', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 1 },
  { name: 'Signup Page', slug: 'auth-signup', module: 'Authentication', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 2 },
  { name: 'Google OAuth Button', slug: 'auth-google', module: 'Authentication', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 3 },
  { name: 'Email OTP Verification', slug: 'auth-otp', module: 'Authentication', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 4 },
  { name: 'Menu Page', slug: 'customer-menu', module: 'Customer', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 1 },
  { name: 'Cart Drawer', slug: 'customer-cart', module: 'Customer', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 2 },
  { name: 'Checkout Page', slug: 'customer-checkout', module: 'Customer', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 3 },
  { name: 'Profile Page', slug: 'customer-profile', module: 'Customer', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 4 },
  { name: 'Order Tracking', slug: 'customer-tracking', module: 'Customer', parent: null, enabled: true, visible: true, roles: [], apiEnabled: true, maintenance: false, beta: false, publicAccess: true, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 5 },
  { name: 'Rider Dashboard', slug: 'rider-dashboard', module: 'Rider', parent: null, enabled: true, visible: true, roles: ['delivery', 'admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 1 },
  { name: 'Order Accept/Reject Controls', slug: 'rider-actions', module: 'Rider', parent: null, enabled: true, visible: true, roles: ['delivery', 'admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 2 },
  { name: 'Live Location Tracking', slug: 'rider-location', module: 'Rider', parent: null, enabled: true, visible: true, roles: ['delivery', 'admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 3 },
  { name: 'Dashboard Overview', slug: 'admin-dashboard', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 1 },
  { name: 'Website CMS', slug: 'admin-cms', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 2 },
  { name: 'Food Inventory', slug: 'admin-food', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 3 },
  { name: 'Restaurant CMS', slug: 'admin-restaurant', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 4 },
  { name: 'Order Dispatch', slug: 'admin-dispatch', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 5 },
  { name: 'User Manager', slug: 'admin-users', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 6 },
  { name: 'Content CMS', slug: 'admin-content', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 7 },
  { name: 'Settings', slug: 'admin-settings', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 8 },
  { name: 'Feature Management', slug: 'admin-features', module: 'Admin', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 9 },
  { name: 'Maintenance Mode', slug: 'system-maintenance', module: 'System', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 1 },
  { name: 'API Rate Limiting', slug: 'system-rate-limit', module: 'System', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 2 },
  { name: 'Socket.IO Live Updates', slug: 'system-socket', module: 'System', parent: null, enabled: true, visible: true, roles: ['admin'], apiEnabled: true, maintenance: false, beta: false, publicAccess: false, mobileEnabled: true, desktopEnabled: true, readOnly: false, order: 3 }
];

export async function seedFeatureFlags() {
  try {
    const operations = featureDefinitions.map((feature) => ({
      updateOne: {
        filter: { slug: feature.slug },
        update: { $setOnInsert: { ...feature }, $set: feature },
        upsert: true
      }
    }));

    if (operations.length) {
      await FeatureFlag.bulkWrite(operations);
    }

    console.log(`Seeded ${featureDefinitions.length} feature flags.`);
  } catch (error) {
    console.error('Failed to seed feature flags:', error.message);
  }
}

export default seedFeatureFlags;
