import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeatureGuard from '../components/FeatureGuard';


const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedCity, setSelectedCity] = useState('lisbon');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/cms/config');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error("Failed to load CMS configurations:", err);
      }
    };
    fetchConfig();
  }, []);

  // Scroll to section handler if navigated from another page
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Clear location state to prevent scrolling again on refreshes
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Navigate to /menu passing search query as state or search parameters
    navigate('/menu', { state: { searchQuery, selectedCity } });
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      {(!config || config.homepage.showHero) && (
        <header className="hero-header section-hero">
          <div className="row hero-content">
            <div className="hero-text-box">
              <p className="hero-subtitle">Satisfy your cravings</p>
              <h1>{config?.homepage?.hero?.heading || "More flavor, <span>less fuss.</span>"}<br />{config?.homepage?.hero?.subheading || "welcome to snack heaven"}</h1>
              <p className="hero-description">
                {config?.homepage?.hero?.description || "Hello, we're Omnifood, your premium food delivery companion. Skip the kitchen chores and enjoy super healthy, delicious chef-curated meals delivered straight to your door."}
              </p>
              
              {/* Search Bar Widget */}
              {(!config || config.homepage.showHeroSearch !== false) && (
                <FeatureGuard slug="hero-search-bar" mode="disabled" fallback={null}>
                  <form onSubmit={handleSearchSubmit} className="hero-search-container">
                    <div className="search-loc-picker">
                      <i className="ion-ios-location"></i>
                      <select 
                        id="locationSelect" 
                        aria-label="Choose your city location"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                      >
                        <option value="delhi">Delhi NCR</option>
                        <option value="lisbon">Lisbon</option>
                        <option value="sf">San Francisco</option>
                        <option value="berlin">Berlin</option>
                        <option value="london">London</option>
                      </select>
                    </div>
                    <div className="search-input-wrapper">
                      <i className="ion-ios-search-strong"></i>
                      <input 
                        type="text" 
                        id="foodSearchInput" 
                        placeholder="Search for sushi, burgers, tacos..." 
                        aria-label="Search food catalog"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn-search" id="heroSearchBtn">Search</button>
                  </form>
                </FeatureGuard>
              )}

              <FeatureGuard slug="hero-cta-buttons" mode="disabled" fallback={null}>
                <div className="hero-cta-buttons">
                  {(!config || config.homepage.showHeroCta1 !== false) && (
                    <a className="btn btn-full" href="#plans" onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('plans').scrollIntoView({ behavior: 'smooth' });
                    }}>Get Started</a>
                  )}
                  {(!config || config.homepage.showHeroCta2 !== false) && (
                    <Link className="btn btn-ghost" to="/menu">Explore Menu</Link>
                  )}
              {(!config || config.homepage.showHeroCta3 !== false) && (
                <Link className="btn btn-outline" to="/signup?role=restaurant_owner">Owner Signup</Link>
              )}
                </div>
              </FeatureGuard>
            </div>

            {/* Hero Image Box with floating badges */}
            <div className="hero-image-box">
              <div className="hero-bg-blob"></div>
              <img src="/static/img/delivery_rider.png" alt="Omnifood Delivery Partner Riding Scooter" className="hero-rider-img" />
              
              {/* Badge 1 */}
              {(!config || config.homepage.showHeroBadge1 !== false) && (
                <div className="floating-badge badge-1">
                  <div className="badge-icon-circle">
                    <i className="ion-ios-stopwatch-outline"></i>
                  </div>
                  <div className="badge-text">
                    <span>Delivery Speed</span>
                    <strong>⚡ 20 Mins</strong>
                  </div>
                </div>
              )}

              {/* Badge 2 */}
              {(!config || config.homepage.showHeroBadge2 !== false) && (
                <div className="floating-badge badge-2">
                  <div className="badge-icon-circle">
                    <i className="ion-ios-star"></i>
                  </div>
                  <div className="badge-text">
                    <span>Customer Rating</span>
                    <strong>⭐ 4.9 Rated</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Section 1: Features */}
      {(!config || config.homepage.showFeatures) && (
        <section className="section-features" id="food-delivery">
          <div className="row">
            <h2>Get food fast &mdash; not fast food</h2>
            <p className="long-copy">
              We know you're busy, but that doesn't mean you should settle for unhealthy fast food options. Let our certified chefs cook premium, high-quality, organic ingredients just for you.
            </p>
          </div>
          
          <div className="row features-grid">
            {(config?.homepage?.featuresList || []).filter(f => f.isActive !== false).map((feat, idx) => (
              <div key={feat._id || idx} className="feature-card">
                <div className="feature-icon-box">
                  <i className={feat.icon || "ion-ios-infinite-outline"}></i>
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Signature Meals Showcase */}
      {(!config || config.homepage.showSignatureMeals) && (
        <section className="section-meals">
          <div className="row">
            <h2>Our signature healthy meals</h2>
            <p className="long-copy">
              A sneak peek at some of our chef's personal favorites. Handcrafted daily with fresh organic ingredients.
            </p>
          </div>

          {(!config || config.homepage.showMealCategories !== false) && (
            <div className="row">
              <div className="categories-chips">
                <Link to="/menu" className="category-chip active">All Categories</Link>
                <Link to="/menu" className="category-chip">Signature</Link>
                <Link to="/menu" className="category-chip">Healthy</Link>
                <Link to="/menu" className="category-chip">Premium</Link>
                <Link to="/menu" className="category-chip">Starters</Link>
              </div>
            </div>
          )}

          <div className="row meals-grid">
            {/* Meal Card 1 */}
            <div className="meal-card">
              <div className="meal-image-container">
                <span className="meal-tag">Signature</span>
                <img src="/static/img/1.jpg" alt="Korean Bibimbap" />
              </div>
              <div className="meal-info">
                <h3>Korean Bibimbap</h3>
                <div className="meal-meta">
                  <span className="meal-price">$15.00</span>
                  <span className="meal-rating">
                    <i className="ion-ios-star"></i> 4.8 (120+ reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Meal Card 2 */}
            <div className="meal-card">
              <div className="meal-image-container">
                <span className="meal-tag">Signature</span>
                <img src="/static/img/2.jpg" alt="Margherita Pizza" />
              </div>
              <div className="meal-info">
                <h3>Margherita Pizza</h3>
                <div className="meal-meta">
                  <span className="meal-price">$18.00</span>
                  <span className="meal-rating">
                    <i className="ion-ios-star"></i> 4.9 (240+ reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Meal Card 3 */}
            <div className="meal-card">
              <div className="meal-image-container">
                <span className="meal-tag">Healthy</span>
                <img src="/static/img/3.jpg" alt="Grilled Chicken Breast" />
              </div>
              <div className="meal-info">
                <h3>Grilled Chicken Breast</h3>
                <div className="meal-meta">
                  <span className="meal-price">$16.50</span>
                  <span className="meal-rating">
                    <i className="ion-ios-star"></i> 4.7 (95+ reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Meal Card 4 */}
            <div className="meal-card">
              <div className="meal-image-container">
                <span className="meal-tag">Starter</span>
                <img src="/static/img/4.jpg" alt="Autumn Pumpkin Soup" />
              </div>
              <div className="meal-info">
                <h3>Autumn Pumpkin Soup</h3>
                <div className="meal-meta">
                  <span className="meal-price">$10.50</span>
                  <span className="meal-rating">
                    <i className="ion-ios-star"></i> 4.6 (80+ reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {(!config || config.homepage.showBrowseMenuBtn !== false) && (
            <div className="row" style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link className="btn btn-full" to="/menu">Browse Complete Menu &rarr;</Link>
            </div>
          )}
        </section>
      )}

      {/* Section 3: How it Works */}
      {(!config || config.homepage.showHowItWorks) && (
        <section className="section-steps" id="How-it-works">
          <div className="row">
            <h2>Simple as 1, 2, 3 &mdash; How it works</h2>
          </div>
          
          <div className="row steps-container">
            <div className="steps-image-box">
              <img src="/static/img/app-iPhone.png" alt="Omnifood app on iPhone" className="app-screen" />
            </div>
            
            <div className="steps-list">
              {(config?.homepage?.stepsList || []).filter(s => s.isActive !== false).sort((a,b) => a.stepNumber - b.stepNumber).map((step, idx) => (
                <div key={step._id || idx} className="works-step">
                  <div className="step-number">{step.stepNumber}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}

              {(!config || config.homepage.showAppButtons !== false) && (
                <div className="app-buttons">
                  <a href="#" className="btn-app" onClick={(e) => e.preventDefault()}><img src="/static/img/download-app.svg" alt="Download on App Store" /></a>
                  <a href="#" className="btn-app" onClick={(e) => e.preventDefault()}><img src="/static/img/download-app-android.png" alt="Download on Play Store" /></a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Cities Hub */}
      {(!config || config.homepage.showCities) && (
        <section className="section-cities" id="Our-cities">
          <div className="row">
            <h2>We're currently in these cities</h2>
          </div>
          
          <div className="row cities-grid">
            {(config?.homepage?.citiesList || []).filter(c => c.isActive !== false).map((city, idx) => (
              <div key={city._id || idx} className="city-card">
                <div className="city-image-container">
                  <img src={city.image || "/static/img/lisbon-3.jpg"} alt={city.name} />
                </div>
                <div className="city-details">
                  <h3>{city.name}</h3>
                  <div className="city-feature">
                    <i className="ion-ios-person"></i>
                    <span>{city.eaters}</span>
                  </div>
                  <div className="city-feature">
                    <i className="ion-ios-star"></i>
                    <span>{city.chefs}</span>
                  </div>
                  <div className="city-feature">
                    <i className="ion-social-twitter"></i>
                    <a href="#twitter" onClick={(e) => e.preventDefault()}>{city.twitter}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 5: Customer Reviews Testimonials Grid */}
      {(!config || config.homepage.showTestimonials) && (
        <section className="section-testimonials">
          <div className="row">
            <h2>Our customers can't live without us</h2>
          </div>
          
          <div className="row testimonials-grid">
            {(config?.homepage?.testimonialsList || []).filter(t => t.isActive !== false).map((test, idx) => (
              <div key={test._id || idx} className="testimonial-card">
                <div className="rating-stars">
                  {Array.from({ length: Math.floor(test.rating || 5) }).map((_, i) => (
                    <i key={i} className="ion-ios-star"></i>
                  ))}
                  {(test.rating % 1 !== 0) && <i className="ion-ios-star-half"></i>}
                </div>
                <blockquote>
                  "{test.quote}"
                </blockquote>
                <div className="testimonial-user">
                  <img src={test.imageUrl || "/static/img/customer-1.jpg"} alt={test.name} />
                  <cite>
                    <span className="testimonial-user-name">{test.name}</span>
                    <span className="testimonial-user-role">{test.role}</span>
                  </cite>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 6: Subscription pricing plans with interactive toggles */}
      {(!config || config.homepage.showPlans) && (
        <section className="section-plans" id="plans">
          <div className="row">
            <h2>Start eating healthy today</h2>
            <p className="long-copy">Choose a plan that fits your style. Switch tiers or pause billing at any point.</p>
          </div>

          {/* Pricing toggle slider */}
          {(!config || config.homepage.showPlansToggle !== false) && (
            <div className="plans-toggle-container">
              <span id="monthlyToggleLabel" className={!isAnnualBilling ? 'toggle-label-active' : ''}>Monthly Billing</span>
              <label className="plans-switch">
                <input 
                  type="checkbox" 
                  id="billingToggle"
                  checked={isAnnualBilling}
                  onChange={() => setIsAnnualBilling(!isAnnualBilling)}
                />
                <span className="plans-slider"></span>
              </label>
              <span id="annualToggleLabel" className={isAnnualBilling ? 'toggle-label-active' : ''}>
                Annual Billing <span className="discount-badge">Save 20%</span>
              </span>
            </div>
          )}

          <div className="row plans-grid">
            {(config?.homepage?.plansList || []).filter(p => p.isActive !== false).map((plan, idx) => (
              <div key={plan._id || idx} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="popular-tag">Best Value</span>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    {isAnnualBilling ? `$${Math.round(parseInt(plan.price) * 0.8)}` : `$${plan.price}`} <span>/ {plan.name === 'STARTER' ? 'meal' : 'month'}</span>
                  </div>
                  <p className="plan-price-meal">
                    {isAnnualBilling && plan.name !== 'STARTER' ? `That's only $${(parseInt(plan.price) * 0.8 / 30).toFixed(2)} per meal` : plan.priceMeal}
                  </p>
                </div>
                <ul className="plan-features">
                  {(plan.features || []).map((feat, fidx) => (
                    <li key={fidx}>
                      <i className={feat.toLowerCase().includes("no ") ? "ion-ios-close-empty" : "ion-ios-checkmark-empty"}></i> {feat}
                    </li>
                  ))}
                </ul>
                <div className="plan-action">
                  <Link to="/signup" className={plan.name === 'STARTER' ? 'btn btn-ghost' : 'btn btn-full'}>Choose {plan.name}</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 7: Form */}
      {(!config || config.homepage.showContactForm) && (
        <section className="section-form" id="Sign-up">
          <div className="row">
            <h2>We're happy to hear from you</h2>
          </div>
          
          <div className="row contact-container">
            {/* Left Side: Contact details */}
            <div className="contact-info-panel">
              <div>
                <h3>Get in touch</h3>
                <p>Have any questions about custom meal programs, delivery logistics, or feedback? Drop us a line!</p>
                
                <div className="info-items">
                  <div className="info-item">
                    <div className="info-icon-circle">
                      <i className="ion-ios-telephone"></i>
                    </div>
                    <div className="info-text">
                      <span>Call Us</span>
                      <p>{config?.homepage?.contact?.phone || "+1 (555) 019-2834"}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon-circle">
                      <i className="ion-ios-email"></i>
                    </div>
                    <div className="info-text">
                      <span>Email Support</span>
                      <p>{config?.homepage?.contact?.email || "hello@omnifood.com"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="contact-map-mockup">
                <p><i className="ion-ios-location" style={{ marginRight: '5px' }}></i> Omnifood NCR HQ Map</p>
              </div>
            </div>

            {/* Right Side: Form pane */}
            <div className="contact-form-panel">
              <form method="post" action="/contact" className="contact-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input type="text" name="name" id="name" placeholder="John Doe" defaultValue={user ? user.name : ''} required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" name="email" id="email" placeholder="john@example.com" defaultValue={user ? user.email : ''} required />
                  </div>
                  
                  <div className="form-group form-group-full">
                    <label htmlFor="find-us">How did you find us?</label>
                    <select name="find-us" id="find-us">
                      <option value="friends">Friends or Referral</option>
                      <option value="search">Search Engine (Google)</option>
                      <option value="ad">Social Media Advertisement</option>
                      <option value="other">Other Options</option>
                    </select>
                  </div>
                  
                  <div className="form-group form-group-full form-checkbox-group">
                    <input type="checkbox" name="news" id="news" defaultChecked />
                    <label htmlFor="news">Yes, send me newsletter updates &amp; discount vouchers</label>
                  </div>
                  
                  <div className="form-group form-group-full">
                    <label htmlFor="message">Drop us a line</label>
                    <textarea name="message" id="message" placeholder="Describe your request..." required></textarea>
                  </div>
                  
                  <div className="form-group form-group-full">
                    <input type="submit" value="Send Message" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
