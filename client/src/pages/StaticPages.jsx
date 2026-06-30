
import { useLocation } from 'react-router-dom';

const StaticPages = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = '';
  let subtitle = '';
  let content = null;

  if (path === '/about') {
    title = 'About Us';
    subtitle = 'Delivering healthy, sustainable gourmet diets since 2015.';
    content = (
      <>
        <p>
          Welcome to Omnifood, your premier companion for premium, organic, and chef-curated daily meal subscriptions. Founded with a vision to make healthy dining accessible, sustainable, and completely hassle-free, we deliver fresh meals directly to your home or office in under 20 minutes.
        </p>
        <h3>Our Mission</h3>
        <p>
          To eliminate junk food options from busy lifestyles by offering delicious, organic, and nutrient-dense foods cooked by local certified chefs. We believe that eating healthy shouldn't be a chore or compromise on taste.
        </p>
        <h3>Our Journey</h3>
        <p>
          Omnifood started in Lisbon in 2015 as a tiny kitchen experiment. Today, we serve thousands of active eaters across Lisbon, San Francisco, London, and Berlin. We are proud to run a fully carbon-neutral operations network.
        </p>
      </>
    );
  } else if (path === '/press') {
    title = 'Press Kit';
    subtitle = 'Media resources, brand logos, and corporate assets.';
    content = (
      <>
        <p>
          Welcome to the Omnifood Press Room. Here you can find our press releases, official media resources, and brand identity kits.
        </p>
        <h3>Official Logos & Assets</h3>
        <p>
          If you are writing an article or featuring Omnifood in a publication, you can download high-resolution copies of our logos and team photos from our corporate dashboard.
        </p>
        <h3>Press Contacts</h3>
        <p>
          For media inquiries, interview requests, or speaker invitations, please reach out directly to our corporate communications desk at <strong>press@omnifood.com</strong>.
        </p>
      </>
    );
  } else if (path === '/careers') {
    title = 'Contact Careers';
    subtitle = 'Join snacker heaven. Help us build the future of food delivery.';
    content = (
      <>
        <p>
          At Omnifood, we are always looking for passionate, creative, and mission-driven professionals to join our growing global team. We offer competitive salaries, flexible work hours, and organic catered lunches daily.
        </p>
        <h3>Open Positions</h3>
        <p>
          Our teams are expanding across engineering, customer support, logistics, and culinary departments. Send your updated resume and portfolio link to <strong>careers@omnifood.com</strong>.
        </p>
      </>
    );
  } else if (path === '/support') {
    title = 'Customer Support';
    subtitle = 'Got questions or feedback? Our team is online 24/7.';
    content = (
      <>
        <p>
          Our customer happiness specialists are online round the clock to resolve issues relating to order tracking, food allergies, payment details, or corporate catering.
        </p>
        <h3>Submit Feedback</h3>
        <p>
          We value your feedback to constantly improve our chef menus and rider delivery speed. Please use the Contact form on the home page or send email directly to <strong>hello@omnifood.com</strong>.
        </p>
      </>
    );
  } else if (path === '/safety') {
    title = 'Safety & Compliance';
    subtitle = 'Highest health, sanitation, and rider safety standards.';
    content = (
      <>
        <p>
          Food safety is our absolute number one priority. Our kitchens operate under strict sanitization protocols and are certified by local municipal health commissions.
        </p>
        <h3>Ingredients Sourcing</h3>
        <p>
          We collaborate strictly with certified organic farms that do not use chemical growth hormones or synthetic pesticides. All raw produce is washed and vacuum-sealed daily.
        </p>
      </>
    );
  } else if (path === '/terms') {
    title = 'Terms of Use';
    subtitle = 'Terms, conditions, and user agreement governing our services.';
    content = (
      <>
        <p>
          By accessing the website or mobile app and placing an order, you agree to comply with and be bound by the terms and conditions set forth in our user agreement.
        </p>
        <h3>Subscription Billing</h3>
        <p>
          Subscription plans are billed monthly or annually depending on your configuration. You can pause or cancel your subscription billing at any point through your profile settings dashboard.
        </p>
      </>
    );
  } else if (path === '/privacy') {
    title = 'Privacy Policy';
    subtitle = 'Learn how we secure and protect your private coordinates.';
    content = (
      <>
        <p>
          Omnifood is committed to securing your private information. We use advanced SSL data encryption and secure credit payment gateways to protect all payment credentials and phone numbers.
        </p>
        <h3>GPS Coords Data</h3>
        <p>
          Rider and customer location data are tracked strictly to coordinate live deliveries and calculate accurate ETA estimates. Coordinates are never shared or sold to third-party ad brokers.
        </p>
      </>
    );
  }

  return (
    <div className="static-page-wrapper">
      <div className="static-hero" style={{ background: 'linear-gradient(135deg, #fdfbfa 0%, #fff7f7 100%)', padding: '140px 0 60px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <div className="row">
          <h1 style={{ fontSize: '2.8rem', marginBottom: '10px' }}>{title}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>{subtitle}</p>
        </div>
      </div>

      <main className="row" style={{ marginTop: '40px' }}>
        <article className="static-content-box" style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '40px', boxShadow: 'var(--shadow-sm)', margin: '-40px auto 80px', maxWidth: '800px', position: 'relative', zIndex: 10 }}>
          {content}
        </article>
      </main>
    </div>
  );
};

export default StaticPages;
