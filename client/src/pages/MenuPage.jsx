import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/menu.css';

// Zomato/Swiggy Restaurants Catalog mapping seeded catalog categories
const RESTAURANTS = [
  {
    id: 'julies',
    name: "Julie's",
    tags: "Italian, Premium Pizzas, Fast Food, Salads",
    rating: 4.7,
    deliveryTime: "15 mins",
    avgPrice: "$20 for one",
    imageUrl: "/static/img/2.jpg",
    promo: "50% OFF | Use code OMNI",
    isGold: true,
    categories: ["Signature", "Starter", "Healthy"]
  },
  {
    id: 'bigbowl',
    name: "Big Bowl",
    tags: "Korean Special Bowls, Organic Vegetables",
    rating: 4.1,
    deliveryTime: "22 mins",
    avgPrice: "$15 for one",
    imageUrl: "/static/img/1.jpg",
    promo: "Buy 1 Get 1 Free",
    isGold: false,
    categories: ["Signature", "Healthy"]
  },
  {
    id: 'mcdonalds',
    name: "McDonald's",
    tags: "Burgers, Starter Meals, American",
    rating: 4.3,
    deliveryTime: "18 mins",
    avgPrice: "$12 for one",
    imageUrl: "/static/img/6.jpg",
    promo: "Flat 20% OFF",
    isGold: true,
    categories: ["Healthy", "Starter"]
  },
  {
    id: 'rukas',
    name: "Rukas",
    tags: "Healthy Organic Bowls, Fresh Green Salads",
    rating: 4.5,
    deliveryTime: "25 mins",
    avgPrice: "$16 for one",
    imageUrl: "/static/img/3.jpg",
    promo: "Free Delivery on orders above $15",
    isGold: false,
    categories: ["Healthy", "Premium"]
  },
  {
    id: 'gurukirpa',
    name: "Gurukirpa Veg Chaap",
    tags: "Indian Organic Soups, Starters",
    rating: 4.0,
    deliveryTime: "28 mins",
    avgPrice: "$10 for one",
    imageUrl: "/static/img/4.jpg",
    promo: "Flat 10% OFF",
    isGold: false,
    categories: ["Starter"]
  },
  {
    id: 'behrouz',
    name: "Behrouz Biryani",
    tags: "Premium Steaks, Rice, Gourmet Diners",
    rating: 4.2,
    deliveryTime: "20 mins",
    avgPrice: "$22 for one",
    imageUrl: "/static/img/5.jpg",
    promo: "Flat 30% OFF with Gold Membership",
    isGold: true,
    categories: ["Premium", "Signature"]
  }
];

const MenuPage = () => {
  const { user } = useAuth();
  const { cart, addToCart, updateQty, subtotal, checkout } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Component States
  const [foodCatalog, setFoodCatalog] = useState([]);
  const [activeTab, setActiveTab] = useState('delivery'); // 'delivery' or 'dining'
  const [activeView, setActiveView] = useState('home'); // 'home' or 'detail'
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  
  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [filters, setFilters] = useState({ gold: false, rating: false });
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'rating', 'time'

  // Cart & Modals
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [config, setConfig] = useState(null);
  
  // Customizer state
  const [customizerItem, setCustomizerItem] = useState(null);
  const [customizerQty, setCustomizerQty] = useState(1);
  const [selectedShell, setSelectedShell] = useState('Wheat Shell');
  const [addons, setAddons] = useState({
    cheese: { name: 'Extra Melted Cheese', price: 1.50, checked: false },
    salsa: { name: 'Spicy Tomato Salsa Dip', price: 1.00, checked: false },
    chipotle: { name: 'Chipotle Cream Dip', price: 1.50, checked: false },
  });

  // Dining form state
  const [diningDetails, setDiningDetails] = useState({
    restaurant: RESTAURANTS[0].name,
    guests: 2,
    date: '',
    time: '',
    name: user ? user.name : '',
  });

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone : '',
    address: user ? user.address : '',
  });

  // Payment step state
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Delivery, 2 = Payment, 3 = Processing, 4 = Success
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card', 'UPI', 'COD'
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cardFlipped, setCardFlipped] = useState(false);
  const [upiTimer, setUpiTimer] = useState(120); // 2 minutes
  const [loaderStatus, setLoaderStatus] = useState('Initializing secure checkout...');
  const [loaderSub, setLoaderSub] = useState('Securing transmission tunnel');

  // card input formatters
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardDetails(prev => ({ ...prev, expiry: value }));
  };

  const handleCardCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardDetails(prev => ({ ...prev, cvv: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setCheckoutStep(2);
  };

  const handlePaymentSubmit = async () => {
    setCheckoutStep(3); // Start Loader
    
    // Simulate banking steps
    const steps = [
      { status: 'Contacting Bank...', sub: 'Establishing connection to payment processor' },
      { status: 'Securing connection...', sub: 'Encrypting credentials with TLS 1.3' },
      { status: 'Authorizing payment details...', sub: 'Verifying card balance and limits' },
      { status: 'Finalizing order...', sub: 'Creating invoice details and rider routing' }
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoaderStatus(steps[i].status);
      setLoaderSub(steps[i].sub);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const result = await checkout({
        customerName: checkoutForm.name,
        email: checkoutForm.email,
        phone: checkoutForm.phone,
        address: checkoutForm.address,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed'
      });

      if (result.success) {
        setCheckoutStep(4); // Success Checkmark
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCheckoutModalOpen(false);
        setCartDrawerOpen(false);
        // Reset steps
        setCheckoutStep(1);
        navigate(`/track/${result.orderId}`);
      } else {
        setCheckoutStep(2); // Go back to payment selection
        alert(result.message || 'Payment failed. Please check details.');
      }
    } catch (err) {
      console.error(err);
      setCheckoutStep(2);
      alert('Payment authorization encountered an error.');
    }
  };

  useEffect(() => {
    let interval;
    if (checkoutStep === 2 && paymentMethod === 'UPI') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUpiTimer(120);
      interval = setInterval(() => {
        setUpiTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkoutStep, paymentMethod]);

  // Countdowns
  const [countdownText, setCountdownText] = useState('14:59 mins left');

  useEffect(() => {
    fetch('/api/cms/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error(err));
  }, []);

  // Load foods & prefill state from hero page search
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch('/api/food');
        let data = await res.json();
        
        // Add Spicy Chickpea Crunch Taco if not present
        const hasTaco = data.some(item => item.name.includes("Taco"));
        if (!hasTaco) {
          data.push({
            _id: "taco_custom_mock_99",
            name: "Spicy Chickpea Crunch Taco",
            description: "Authentic double decker shell loaded with protein-rich chickpeas, cheese, fresh lettuce, and organic spicy salsa.",
            price: 10.00,
            imageUrl: "/static/img/taco.png",
            category: "Signature"
          });
        }
        setFoodCatalog(data);
      } catch (err) {
        console.error("Failed to fetch food catalog from backend API:", err);
        // Fallback mockup
        setFoodCatalog([
          { _id: "1", name: "Korean Bibimbap", description: "Organic rice bowl packed with fresh vegetables and seasoned egg.", price: 15.00, imageUrl: "/static/img/1.jpg", category: "Signature" },
          { _id: "2", name: "Margherita Pizza", description: "Authentic Italian crust with cherry tomatoes, fresh mozzarella, and basil.", price: 18.00, imageUrl: "/static/img/2.jpg", category: "Signature" },
          { _id: "3", name: "Grilled Chicken Breast", description: "Skinless grilled chicken with seasonal roasted veggies.", price: 16.50, imageUrl: "/static/img/3.jpg", category: "Healthy" },
          { _id: "4", name: "Autumn Pumpkin Soup", description: "Velvety pumpkin soup with wild herbs and pumpkin seeds.", price: 10.50, imageUrl: "/static/img/4.jpg", category: "Starter" },
          { _id: "5", name: "Paleo Beef Steak", description: "Premium grass-fed beef served with grilled asparagus.", price: 22.00, imageUrl: "/static/img/5.jpg", category: "Premium" },
          { _id: "6", name: "Breakfast Baguette", description: "Whole-grain bread stuffed with poached eggs and spinach.", price: 12.00, imageUrl: "/static/img/6.jpg", category: "Healthy" },
          { _id: "taco_custom_mock_99", name: "Spicy Chickpea Crunch Taco", description: "Double decker shell loaded with chickpeas, cheese, and spicy salsa.", price: 10.00, imageUrl: "/static/img/taco.png", category: "Signature" }
        ]);
      }
    };
    
    fetchFoods();



    // Flash countdown timer
    let mins = 14;
    let secs = 59;
    const timer = setInterval(() => {
      if (secs === 0) {
        if (mins === 0) {
          clearInterval(timer);
        } else {
          mins--;
          secs = 59;
        }
      } else {
        secs--;
      }
      setCountdownText(`${mins}:${secs < 10 ? '0' : ''}${secs} mins left`);
    }, 1000);

    return () => clearInterval(timer);
  }, [location]);

  // Sync checkout fields if user logs in/out
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckoutForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setDiningDetails(prev => ({ ...prev, name: user.name || '' }));
    }
  }, [user]);

  // Toggle Filters
  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSortToggle = () => {
    if (sortOrder === 'default') {
      setSortOrder('rating');
    } else if (sortOrder === 'rating') {
      setSortOrder('time');
    } else {
      setSortOrder('default');
    }
  };

  const resetFilters = () => {
    setFilters({ gold: false, rating: false });
    setSortOrder('default');
    setSelectedCategory(null);
    setIsVegOnly(false);
  };

  // Filter & Sort Logic for Restaurants
  const getFilteredRestaurants = () => {
    let list = [...RESTAURANTS];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.tags.toLowerCase().includes(q));
    }
    
    if (selectedCategory) {
      list = list.filter(r => r.categories.includes(selectedCategory));
    }
    
    if (filters.gold) {
      list = list.filter(r => r.isGold);
    }
    
    if (filters.rating) {
      list = list.filter(r => r.rating >= 4.3);
    }
    
    if (isVegOnly) {
      // Mock category mapping for veg
      list = list.filter(r => r.categories.includes("Starter") || r.categories.includes("Healthy") || r.categories.includes("Signature"));
    }
    
    if (sortOrder === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === 'time') {
      list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
    }
    
    return list;
  };

  // Add Item Click Router (Taco shells & Pizzas trigger customizer)
  const handleAddItemClick = (itemId) => {
    const food = foodCatalog.find(f => f._id === itemId);
    if (!food) return;
    
    const isCustomizable = food.name.toLowerCase().includes("taco") || food.name.toLowerCase().includes("pizza");
    if (isCustomizable) {
      setCustomizerItem(food);
      setCustomizerQty(1);
      setSelectedShell('Wheat Shell');
      setAddons({
        cheese: { name: 'Extra Melted Cheese', price: 1.50, checked: false },
        salsa: { name: 'Spicy Tomato Salsa Dip', price: 1.00, checked: false },
        chipotle: { name: 'Chipotle Cream Dip', price: 1.50, checked: false },
      });
      setCustomizerOpen(true);
    } else {
      addToCart(food, 1);
    }
  };

  // Customizer price calculator
  const getCustomizerPrice = () => {
    if (!customizerItem) return 0;
    let base = customizerItem.price;
    Object.keys(addons).forEach(key => {
      if (addons[key].checked) {
        base += addons[key].price;
      }
    });
    return base * customizerQty;
  };

  const addCustomizedItemToOrder = () => {
    const activeAddons = [];
    Object.keys(addons).forEach(key => {
      if (addons[key].checked) {
        activeAddons.push({ name: addons[key].name, price: addons[key].price });
      }
    });

    addToCart(customizerItem, customizerQty, {
      shell: selectedShell,
      addons: activeAddons
    });

    setCustomizerOpen(false);
  };

  const handleDiningBooking = (e) => {
    e.preventDefault();
    alert(`Dining reservation confirmed successfully!\nRestaurant: ${diningDetails.restaurant}\nGuests: ${diningDetails.guests}\nDate: ${diningDetails.date}\nTime: ${diningDetails.time}`);
  };

  const activeRest = RESTAURANTS.find(r => r.id === activeRestaurantId);

  return (
    <div className="menu-view-container">
      
      {/* Search Header Panel */}
      {activeView === 'home' && (
        <div className="menu-search-header" id="searchPanel">
          <div className="search-deck-card">
            <div className="deck-search-input">
              <i className="ion-ios-search-strong"></i>
              <input 
                type="text" 
                placeholder="Search food items or restaurants..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="deck-veg-toggle">
              <input 
                type="checkbox" 
                id="vegCheckbox" 
                checked={isVegOnly}
                onChange={(e) => setIsVegOnly(e.target.checked)}
              />
              <label htmlFor="vegCheckbox">Veg Only</label>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="menu-app-main row">
        
        {/* ================= HOME VIEW (RESTAURANTS GRID) ================= */}
        {activeView === 'home' && (
          <div id="homeView">
            
            {/* Hero Banners Grid */}
            <div className="hero-banners-grid">
              <div className="cravings-banner">
                <div className="banner-info">
                  <span className="banner-badge">Trending #1</span>
                  <h2>Your Cravings,<br /><span>Delivered Fresh</span></h2>
                  <button className="btn-banner-action" onClick={() => {
                    document.getElementById('restaurants-section').scrollIntoView({ behavior: 'smooth' });
                  }}>Order Now</button>
                </div>
                <img src="/static/img/delivery_rider.png" alt="Delivery Rider Illustration" className="banner-image" />
              </div>
              
              <div className="flash-sale-banner">
                <span className="flash-badge">Flash Sale</span>
                <h3>Flat 50% Off</h3>
                <p>Get signature gourmet meals delivered instantly at half the price.</p>
                <div className="flash-timer">
                  <i className="ion-android-time"></i>
                  <span>{countdownText}</span>
                </div>
              </div>
            </div>

            {/* Category selection chips */}
            <div className="categories-chips" style={{ marginTop: '24px' }}>
              <button 
                className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </button>
              {['Signature', 'Healthy', 'Premium', 'Starter'].map(cat => (
                <button 
                  key={cat}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'Starter' ? 'Starters' : cat}
                </button>
              ))}
            </div>

            {/* Quick Explore Option Cards */}
            <div className="section-title">
              <span>Explore options</span>
            </div>
            <div className="explore-grid">
              <div className="explore-item" onClick={() => toggleFilter('gold')}>
                <i className="ion-ios-bookmarks" style={{ color: '#d4af37' }}></i>
                <div className="explore-info">
                  <h4>Gold Offers</h4>
                  <p>Extra discounts</p>
                </div>
              </div>
              <div className="explore-item" onClick={() => setSelectedCategory('Premium')}>
                <i className="ion-ios-star" style={{ color: '#e67e22' }}></i>
                <div className="explore-info">
                  <h4>Premium Dining</h4>
                  <p>Luxury meals</p>
                </div>
              </div>
              <div className="explore-item" onClick={() => toggleFilter('rating')}>
                <i className="ion-ios-heart" style={{ color: '#f05c3c' }}></i>
                <div className="explore-info">
                  <h4>Top Rated</h4>
                  <p>4.3+ Stars</p>
                </div>
              </div>
              <div className="explore-item" onClick={() => setSelectedCategory('Healthy')}>
                <i className="ion-leaf" style={{ color: '#25c577' }}></i>
                <div className="explore-info">
                  <h4>Healthy Choices</h4>
                  <p>Low calorie</p>
                </div>
              </div>
            </div>

            {/* Filters Bar & Tab Toggle */}
            <div className="filters-row" id="restaurants-section">
              <div className="quick-filters-deck">
                <div 
                  className={`filter-pill ${sortOrder !== 'default' ? 'active' : ''}`}
                  onClick={handleSortToggle}
                >
                  <span>
                    {sortOrder === 'default' && 'Sort By'}
                    {sortOrder === 'rating' && 'Rating: High to Low'}
                    {sortOrder === 'time' && 'Delivery Time'}
                  </span>
                  <i className="ion-arrow-down-b"></i>
                </div>
                
                <div 
                  className={`filter-pill ${filters.gold ? 'active' : ''}`}
                  onClick={() => toggleFilter('gold')}
                >
                  <span>Gold Offers</span>
                </div>
                
                <div 
                  className={`filter-pill ${filters.rating ? 'active' : ''}`}
                  onClick={() => toggleFilter('rating')}
                >
                  <span>Ratings 4.3+</span>
                </div>
                
                {(filters.gold || filters.rating || sortOrder !== 'default' || selectedCategory !== null || isVegOnly) && (
                  <div 
                    className="filter-pill reset-pill" 
                    onClick={resetFilters} 
                    style={{ borderColor: '#f05c3c', color: '#f05c3c' }}
                  >
                    <span>Reset Filters</span>
                    <i className="ion-android-close"></i>
                  </div>
                )}
              </div>
              
              <div className="tab-toggle-container">
                <button 
                  className={`toggle-tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('delivery')}
                >
                  <i className="ion-android-bicycle" style={{ marginRight: '4px' }}></i> Delivery
                </button>
                <button 
                  className={`toggle-tab-btn ${activeTab === 'dining' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dining')}
                >
                  <i className="ion-ios-wineglass" style={{ marginRight: '4px' }}></i> Dining
                </button>
              </div>
            </div>

            {/* Delivery Restaurant Cards List */}
            {activeTab === 'delivery' ? (
              <div id="deliveryRestaurantsView">
                <div className="restaurant-grid" id="restaurantGrid">
                  {getFilteredRestaurants().map(r => (
                    <div key={r.id} className="restaurant-card" onClick={() => {
                      setActiveRestaurantId(r.id);
                      setActiveView('detail');
                    }}>
                      <div className="rest-img-box">
                        <img src={r.imageUrl} alt={r.name} />
                        <span className="promo-badge">{r.promo}</span>
                        {r.isGold && <span className="gold-badge">Gold</span>}
                      </div>
                      <div className="rest-content">
                        <div className="rest-row">
                          <h3 className="rest-name">{r.name}</h3>
                          <div className="rating-pill">
                            <span>{r.rating}</span> <i className="ion-android-star"></i>
                          </div>
                        </div>
                        <div className="rest-row">
                          <span className="rest-tags">{r.tags}</span>
                          <span className="rest-price">{r.avgPrice}</span>
                        </div>
                        <div className="rest-meta">
                          <span><i className="ion-android-bicycle"></i> Free Delivery</span>
                          <span><i className="ion-android-time"></i> {r.deliveryTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Dining Reservation Form */
              <div id="diningView">
                <div className="dining-view-container">
                  <i className="ion-ios-wineglass hero-icon"></i>
                  <h3>Book Premium Dining Tables</h3>
                  <p>Reserve gourmet dining seats at the finest local restaurants directly through Omnifood Dining. Skip queues and unlock special loyalty discounts.</p>
                  
                  <form className="dining-form" id="diningForm" onSubmit={handleDiningBooking}>
                    <div className="dining-form-group">
                      <label htmlFor="dRest">Select Restaurant</label>
                      <select 
                        id="dRest" 
                        className="dining-input" 
                        value={diningDetails.restaurant}
                        onChange={(e) => setDiningDetails({ ...diningDetails, restaurant: e.target.value })}
                        required
                      >
                        {RESTAURANTS.map(r => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="dining-form-group">
                      <label htmlFor="dGuests">Number of Guests</label>
                      <input 
                        type="number" 
                        id="dGuests" 
                        className="dining-input" 
                        min="1" 
                        max="20" 
                        value={diningDetails.guests}
                        onChange={(e) => setDiningDetails({ ...diningDetails, guests: parseInt(e.target.value) })}
                        required 
                      />
                    </div>
                    <div className="dining-form-group">
                      <label htmlFor="dDate">Reservation Date</label>
                      <input 
                        type="date" 
                        id="dDate" 
                        className="dining-input" 
                        value={diningDetails.date}
                        onChange={(e) => setDiningDetails({ ...diningDetails, date: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="dining-form-group">
                      <label htmlFor="dTime">Arrival Time</label>
                      <input 
                        type="time" 
                        id="dTime" 
                        className="dining-input" 
                        value={diningDetails.time}
                        onChange={(e) => setDiningDetails({ ...diningDetails, time: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="dining-form-group full-width">
                      <label htmlFor="dName">Contact Name</label>
                      <input 
                        type="text" 
                        id="dName" 
                        className="dining-input" 
                        placeholder="Your Full Name" 
                        value={diningDetails.name}
                        onChange={(e) => setDiningDetails({ ...diningDetails, name: e.target.value })}
                        required 
                      />
                    </div>
                    <button type="submit" className="btn-dining-submit">Confirm Reservation Table</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= RESTAURANT MENU DETAIL VIEW ================= */}
        {activeView === 'detail' && activeRest && (
          <div id="restaurantDetailView" className="rest-detail-view">
            <button className="btn-back-to-home" onClick={() => setActiveView('home')}>
              <i className="ion-android-arrow-back"></i> Back to Restaurants
            </button>
            
            <div id="restDetailHeader">
              <div className="rest-detail-header-card">
                <img className="detail-header-img" src={activeRest.imageUrl} alt={activeRest.name} />
                <div className="detail-header-info">
                  <h2>{activeRest.name}</h2>
                  <div className="detail-header-tags">{activeRest.tags}</div>
                  <div className="detail-header-meta-row">
                    <span className="rating-span">{activeRest.rating} <i className="ion-android-star"></i></span>
                    <span><i className="ion-android-bicycle"></i> Free Delivery</span>
                    <span><i className="ion-android-time"></i> {activeRest.deliveryTime}</span>
                  </div>
                </div>
                <div className="detail-header-right">
                  <div className="group-order-toggle" onClick={() => alert("Group ordering initiated! Share your cart token with coworkers.")}>
                    <i className="ion-ios-people"></i> Group Order
                  </div>
                  <div className="promo-box-detail">
                    <div className="promo-title-detail">{activeRest.promo}</div>
                    <div className="promo-sub-detail">Valid on online orders placed today</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="menu-section-container">
              {/* Left Sidebar Nav */}
              <div className="menu-sidebar-nav">
                {activeRest.categories.map(cat => (
                  <div 
                    key={cat} 
                    className="menu-sidebar-link"
                    onClick={() => {
                      const el = document.getElementById(`sec-${cat.toLowerCase()}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {cat} Selection
                  </div>
                ))}
              </div>
              
              {/* Right Menu Grid items */}
              <div className="menu-items-catalog" id="menuItemsCatalog">
                {activeRest.categories.map(cat => {
                  const items = foodCatalog.filter(f => f.category === cat);
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={cat} className="menu-cat-section" id={`sec-${cat.toLowerCase()}`}>
                      <h3>{cat} Selection</h3>
                      <div className="catalog-item-list">
                        {items.map(food => {
                          const isCustomizable = food.name.toLowerCase().includes("taco") || food.name.toLowerCase().includes("pizza");
                          return (
                            <div key={food._id} className="food-item-row">
                              <div className="food-item-info">
                                <div className={`food-type-icon ${food.category === 'Premium' ? 'non-veg' : 'veg'}`}></div>
                                <div className="food-item-name-row">
                                  <span className="food-item-title">{food.name}</span>
                                  {isCustomizable && <span className="customizer-tag">Customizable</span>}
                                </div>
                                <div className="food-item-price-val">${food.price.toFixed(2)}</div>
                                <div className="food-item-desc-val">{food.description}</div>
                              </div>
                              <div className="food-item-action-box">
                                <img src={food.imageUrl} alt={food.name} />
                                <button className="btn-food-add" onClick={() => handleAddItemClick(food._id)}>Add</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating Cart Trigger Button */}
      <div className="cart-floating-trigger" id="cartTriggerBtn" onClick={() => setCartDrawerOpen(true)}>
        <i className="ion-ios-cart" style={{ fontSize: '1.8rem' }}></i>
        <div className="cart-count-badge" id="cartCountBadge">
          {cart.reduce((sum, item) => sum + item.qty, 0)}
        </div>
      </div>

      {/* Mobile Bottom Navigation Sticky Bar */}
      {activeView === 'home' && (
        <div className="mobile-bottom-nav">
          <div 
            className={`mobile-nav-item ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            <i className="ion-android-bicycle"></i>
            <span>Delivery</span>
          </div>
          <div 
            className={`mobile-nav-item ${activeTab === 'dining' ? 'active' : ''}`}
            onClick={() => setActiveTab('dining')}
          >
            <i className="ion-ios-wineglass"></i>
            <span>Dining</span>
          </div>
        </div>
      )}

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Zomato Bottom-Drawer Customize Modal */}
      {customizerOpen && customizerItem && (
        <div className="customizer-backdrop" id="customizerModal" onClick={() => setCustomizerOpen(false)}>
          <div className="customizer-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="customizer-banner-box">
              <img id="custItemImg" src={customizerItem.imageUrl} alt="Customizer Banner" />
              <button className="btn-close-customizer" onClick={() => setCustomizerOpen(false)}>&times;</button>
            </div>
            
            <div className="customizer-body">
              <div className="customizer-title-section">
                <h3 id="custItemName">{customizerItem.name}</h3>
                <div className="customizer-base-price" id="custBasePrice">${customizerItem.price.toFixed(2)}</div>
                <p id="custItemDesc" style={{ fontSize: '0.8rem', color: '#9a9ab0', marginTop: '4px' }}>
                  {customizerItem.description}
                </p>
              </div>
              
              {/* Customize Option Groups */}
              <div id="customizerOptionGroups">
                
                {/* 1. Taco Shell Select (Radio) */}
                <div className="customizer-group">
                  <div className="customizer-group-header">
                    <span className="customizer-group-title">Choice of Taco Shell</span>
                    <span className="customizer-group-required">Required</span>
                  </div>
                  <div className="customizer-option-row" onClick={() => setSelectedShell('Wheat Shell')}>
                    <div className="customizer-option-input-label">
                      <input 
                        type="radio" 
                        id="shell-wheat" 
                        name="taco-shell" 
                        value="Wheat Shell"
                        checked={selectedShell === 'Wheat Shell'}
                        onChange={() => {}} 
                      />
                      <span>Wheat Shell</span>
                    </div>
                    <span className="customizer-option-price">Free</span>
                  </div>
                  <div className="customizer-option-row" onClick={() => setSelectedShell('Corn Shell')}>
                    <div className="customizer-option-input-label">
                      <input 
                        type="radio" 
                        id="shell-corn" 
                        name="taco-shell" 
                        value="Corn Shell"
                        checked={selectedShell === 'Corn Shell'}
                        onChange={() => {}} 
                      />
                      <span>Corn Shell (Crispy)</span>
                    </div>
                    <span className="customizer-option-price">Free</span>
                  </div>
                </div>
                
                {/* 2. Add-Ons Select (Checkbox) */}
                <div className="customizer-group">
                  <div className="customizer-group-header">
                    <span className="customizer-group-title">Add-Ons & Dips</span>
                  </div>
                  {Object.keys(addons).map(key => (
                    <div 
                      key={key} 
                      className="customizer-option-row" 
                      onClick={() => setAddons({
                        ...addons,
                        [key]: { ...addons[key], checked: !addons[key].checked }
                      })}
                    >
                      <div className="customizer-option-input-label">
                        <input 
                          type="checkbox" 
                          checked={addons[key].checked}
                          onChange={() => {}} 
                        />
                        <span>{addons[key].name}</span>
                      </div>
                      <span className="customizer-option-price">+${addons[key].price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="customizer-footer">
              <div className="customizer-qty-selector">
                <button className="qty-btn-custom" onClick={() => setCustomizerQty(Math.max(1, customizerQty - 1))}>-</button>
                <span className="qty-val-custom" id="custQtyText">{customizerQty}</span>
                <button className="qty-btn-custom" onClick={() => setCustomizerQty(customizerQty + 1)}>+</button>
              </div>
              <button 
                className="btn-add-customizer-item" 
                id="btnAddToOrderCust" 
                onClick={addCustomizedItemToOrder}
              >
                Add Item - ${getCustomizerPrice().toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sliding Cart Side Drawer */}
      {cartDrawerOpen && (
        <div className="cart-drawer-backdrop open" id="cartDrawerBackdrop" onClick={() => setCartDrawerOpen(false)}>
          <div className="cart-sliding-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h3>Your Cravings Cart</h3>
              <button className="btn-close-cart" onClick={() => setCartDrawerOpen(false)}>&times;</button>
            </div>
            
            <div className="cart-drawer-items-list" id="cartItemsList">
              {cart.length === 0 ? (
                <div className="cart-empty-state-text">Select gourmet meals to fill your cravings cart!</div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cart-drawer-item-row" style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '12px 0' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', marginRight: '12px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1c1c1c', fontSize: '0.9rem' }}>{item.name}</div>
                      {item.customization && (
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          Shell: {item.customization.shell}
                          {item.customization.addons && item.customization.addons.length > 0 && (
                            <span> | Toppings: {item.customization.addons.map(a => a.name).join(', ')}</span>
                          )}
                        </div>
                      )}
                      <div style={{ fontWeight: '700', color: '#e67e22', fontSize: '0.9rem', marginTop: '4px' }}>
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button onClick={() => updateQty(index, -1)} style={{ padding: '2px 8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>-</button>
                      <span style={{ padding: '0 8px', fontWeight: '600' }}>{item.qty}</span>
                      <button onClick={() => updateQty(index, 1)} style={{ padding: '2px 8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="cart-drawer-summary" id="cartSummarySection">
                <div className="cart-summary-line">
                  <span>Subtotal</span>
                  <span id="subtotalVal">${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-line">
                  <span>Delivery Charge</span>
                  <span style={{ color: '#25c577', fontWeight: 500 }}>FREE</span>
                </div>
                <div className="cart-summary-line total">
                  <span>Grand Total</span>
                  <span id="totalVal">${subtotal.toFixed(2)}</span>
                </div>
                <button className="btn-cart-checkout" onClick={() => {
                   if (config?.website?.disableCheckoutPage) {
                     alert("Online checkout is temporarily offline. We are preparing orders via phone/COD only.");
                   } else {
                     setCheckoutModalOpen(true);
                   }
                 }}>Proceed to Order</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal Overlay */}
      {checkoutModalOpen && (
        <div className="modal-overlay open" id="checkoutOverlay" onClick={() => {
          if (checkoutStep === 1 || checkoutStep === 2) {
            setCheckoutModalOpen(false);
            setCheckoutStep(1);
          }
        }}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Header step progress */}
            {checkoutStep < 3 && (
              <div className="checkout-steps-header">
                <div className={`checkout-step-indicator ${checkoutStep === 1 ? 'active' : 'completed'}`}>
                  <i className="ion-android-person"></i>
                  <span>Details</span>
                </div>
                <div className={`checkout-step-line ${checkoutStep === 2 ? 'completed' : ''}`}></div>
                <div className={`checkout-step-indicator ${checkoutStep === 2 ? 'active' : ''}`}>
                  <i className="ion-card"></i>
                  <span>Payment</span>
                </div>
              </div>
            )}

            {/* STEP 1: Details Form */}
            {checkoutStep === 1 && (
              <>
                <h3 className="checkout-title">Gourmet Checkout Details</h3>
                <form id="checkoutForm" onSubmit={handleNextStep}>
                  <div className="checkout-form-group">
                    <label htmlFor="cName">Recipient's Full Name</label>
                    <input 
                      type="text" 
                      id="cName" 
                      className="checkout-input" 
                      placeholder="e.g. Karan Gehlot" 
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="checkout-form-group">
                    <label htmlFor="cEmail">Email Address</label>
                    <input 
                      type="email" 
                      id="cEmail" 
                      className="checkout-input" 
                      placeholder="e.g. name@example.com" 
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="checkout-form-group">
                    <label htmlFor="cPhone">Contact Phone Number</label>
                    <input 
                      type="tel" 
                      id="cPhone" 
                      className="checkout-input" 
                      placeholder="e.g. +91 99999 99999" 
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="checkout-form-group">
                    <label htmlFor="cAddress">Delivery Address</label>
                    <input 
                      type="text" 
                      id="cAddress" 
                      className="checkout-input" 
                      placeholder="e.g. Ludhiana Bus Stop Sector 15" 
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="checkout-buttons-row">
                    <button type="button" className="btn-cancel" onClick={() => setCheckoutModalOpen(false)}>Go Back</button>
                    <button type="submit" className="btn-submit-order">Continue to Payment</button>
                  </div>
                </form>
              </>
            )}

            {/* STEP 2: Secure Payment Gateway */}
            {checkoutStep === 2 && (
              <div>
                <h3 className="checkout-title" style={{ marginBottom: '16px' }}>Secure Payment</h3>
                
                {/* Tabs to select payment method */}
                <div className="payment-tabs">
                  <button 
                    type="button" 
                    className={`payment-tab-btn ${paymentMethod === 'Card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('Card')}
                  >
                    <i className="ion-card"></i>
                    <span>Card</span>
                  </button>
                  <button 
                    type="button" 
                    className={`payment-tab-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                  >
                    <i className="ion-iphone"></i>
                    <span>UPI / Scan</span>
                  </button>
                  <button 
                    type="button" 
                    className={`payment-tab-btn ${paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <i className="ion-cash"></i>
                    <span>Cash / COD</span>
                  </button>
                </div>

                {/* Sub-panels for payment options */}
                
                {/* A. Credit/Debit Card Panel */}
                {paymentMethod === 'Card' && (
                  <div>
                    {/* Live Virtual Card Preview */}
                    <div className={`card-container ${cardFlipped ? 'flipped' : ''}`}>
                      <div className="credit-card-inner">
                        {/* Front Face */}
                        <div className="card-face front">
                          <div className="card-header-row">
                            <div className="card-chip"></div>
                            <div className="card-logo">OMNIFOOD</div>
                          </div>
                          <div className="card-number-display">
                            {cardDetails.number || '•••• •••• •••• ••••'}
                          </div>
                          <div className="card-footer-row">
                            <div className="card-holder-section">
                              <span className="card-label-small">Card Holder</span>
                              <span className="card-value-display">{cardDetails.name || 'FULL NAME'}</span>
                            </div>
                            <div className="card-expiry-section">
                              <span className="card-label-small">Expires</span>
                              <span className="card-value-display">{cardDetails.expiry || 'MM/YY'}</span>
                            </div>
                          </div>
                        </div>
                        {/* Back Face */}
                        <div className="card-face back">
                          <div className="card-magnetic-strip"></div>
                          <div className="card-signature-box">
                            <div className="card-cvv-display">{cardDetails.cvv || '•••'}</div>
                          </div>
                          <p className="card-back-text">
                            This card is a simulated layout for visual display. Securely processed by Omnifood encryption gateway. Do not use real credentials.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Form fields */}
                    <form onSubmit={(e) => { e.preventDefault(); handlePaymentSubmit(); }}>
                      <div className="checkout-form-group">
                        <label htmlFor="cardNum">Card Number</label>
                        <input 
                          type="text" 
                          id="cardNum" 
                          className="checkout-input"
                          placeholder="4111 2222 3333 4444"
                          value={cardDetails.number}
                          onChange={handleCardNumberChange}
                          required
                        />
                      </div>
                      <div className="checkout-form-group">
                        <label htmlFor="cardName">Cardholder Name</label>
                        <input 
                          type="text" 
                          id="cardName" 
                          className="checkout-input"
                          placeholder="e.g. Karan Gehlot"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="checkout-form-group" style={{ flex: 1 }}>
                          <label htmlFor="cardExp">Expiry Date</label>
                          <input 
                            type="text" 
                            id="cardExp" 
                            className="checkout-input"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={handleCardExpiryChange}
                            required
                          />
                        </div>
                        <div className="checkout-form-group" style={{ flex: 1 }}>
                          <label htmlFor="cardCvv">CVV</label>
                          <input 
                            type="password" 
                            id="cardCvv" 
                            className="checkout-input"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={handleCardCvvChange}
                            onFocus={() => setCardFlipped(true)}
                            onBlur={() => setCardFlipped(false)}
                            required
                          />
                        </div>
                      </div>

                      <div className="checkout-buttons-row">
                        <button type="button" className="btn-cancel" onClick={() => setCheckoutStep(1)}>Go Back</button>
                        <button type="submit" className="btn-submit-order">Pay ${subtotal.toFixed(2)}</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* B. UPI / QR Scan Panel */}
                {paymentMethod === 'UPI' && (
                  <div>
                    <div className="upi-qr-wrapper">
                      <div className="upi-qr-container">
                        <div style={{
                          width: '160px',
                          height: '160px',
                          background: 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px)',
                          border: '4px solid #1c1c24',
                          borderRadius: '8px',
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <div style={{ position: 'absolute', top: 5, left: 5, width: 30, height: 30, border: '4px solid #1c1c24', background: '#fff' }}></div>
                          <div style={{ position: 'absolute', top: 5, right: 5, width: 30, height: 30, border: '4px solid #1c1c24', background: '#fff' }}></div>
                          <div style={{ position: 'absolute', bottom: 5, left: 5, width: 30, height: 30, border: '4px solid #1c1c24', background: '#fff' }}></div>
                          <div style={{ padding: '4px 8px', background: 'var(--primary)', color: '#fff', fontWeight: 'bold', fontSize: '0.65rem', borderRadius: '4px', zIndex: 2, boxShadow: 'var(--shadow-sm)' }}>
                            OMNI
                          </div>
                        </div>
                      </div>
                      
                      <div className="upi-timer">
                        <i className="ion-android-time"></i>
                        <span>QR Expires in {Math.floor(upiTimer / 60)}:{(upiTimer % 60 < 10 ? '0' : '') + (upiTimer % 60)}</span>
                      </div>
                      
                      <p className="upi-instructions">
                        Scan the QR code using any UPI app (PhonePe, GPay, Paytm) to complete the payment of <strong>${subtotal.toFixed(2)}</strong>.
                      </p>
                    </div>

                    <div className="checkout-buttons-row">
                      <button type="button" className="btn-cancel" onClick={() => setCheckoutStep(1)}>Go Back</button>
                      <button type="button" className="btn-submit-order" onClick={handlePaymentSubmit}>Verify Scan & Order</button>
                    </div>
                  </div>
                )}

                {/* C. Cash on Delivery Panel */}
                {paymentMethod === 'COD' && (
                  <div>
                    <div className="cod-banner">
                      <i className="ion-cash"></i>
                      <div className="cod-banner-content">
                        <h4>Cash / Card on Delivery</h4>
                        <p>
                          Pay the rider directly at your door using cash or scan code. Digital invoice copy will be sent to <strong>{checkoutForm.email}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="checkout-buttons-row">
                      <button type="button" className="btn-cancel" onClick={() => setCheckoutStep(1)}>Go Back</button>
                      <button type="button" className="btn-submit-order" onClick={handlePaymentSubmit}>Place COD Order</button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* STEP 3: Payment Loading Simulator */}
            {checkoutStep === 3 && (
              <div className="payment-processing-loader">
                <div className="payment-spinner"></div>
                <div className="payment-loader-status">{loaderStatus}</div>
                <div className="payment-loader-sub">{loaderSub}</div>
              </div>
            )}

            {/* STEP 4: Success Stage */}
            {checkoutStep === 4 && (
              <div className="payment-success-box">
                <div className="success-checkmark">
                  <i className="ion-android-done"></i>
                </div>
                <div className="payment-loader-status">Order Placed Successfully!</div>
                <div className="payment-loader-sub">Redirecting you to Live Track screen...</div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default MenuPage;
