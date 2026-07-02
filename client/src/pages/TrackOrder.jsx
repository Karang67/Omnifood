import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/track.css';

const riderIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [24, 38],
  iconAnchor: [12, 38],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [24, 38],
  iconAnchor: [12, 38],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [24, 38],
  iconAnchor: [12, 38],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapBounds = ({ order }) => {
  const map = useMap();

  useEffect(() => {
    const positions = [
      [order.coords.shopLat, order.coords.shopLng],
      [order.coords.customerLat, order.coords.customerLng],
    ];

    if (order.deliveryPartner && order.deliveryPartner.lat != null && order.deliveryPartner.lng != null) {
      positions.splice(1, 0, [order.deliveryPartner.lat, order.deliveryPartner.lng]);
    }

    try {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } catch (err) {
      console.warn('Unable to fit map bounds:', err);
    }
  }, [map, order]);

  return null;
};

const TrackOrder = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = new URLSearchParams(location.search);
  const emailParam = searchParams.get('email') || '';
  const phoneParam = searchParams.get('phone') || '';
  const [guestEmail, setGuestEmail] = useState(emailParam);
  const [guestPhone, setGuestPhone] = useState(phoneParam);
  const [submittingGuest, setSubmittingGuest] = useState(false);

  async function fetchOrderStatus(email, phone) {
    setLoading(true);
    try {
      const query = email && phone ? `?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}` : '';
      const res = await fetch(`/api/order/${orderId}${query}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setError(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Unable to retrieve order details.');
        setOrder(null);
      }
    } catch (e) {
      console.error('Failed to query live status updates:', e);
      setError('Unable to retrieve order details at this time.');
      setOrder(null);
    } finally {
      setLoading(false);
      setSubmittingGuest(false);
    }
  }

  useEffect(() => {
    const email = emailParam || guestEmail;
    const phone = phoneParam || guestPhone;

    fetchOrderStatus(email, phone);

    const interval = setInterval(() => {
      fetchOrderStatus(email, phone);
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, emailParam, phoneParam, guestEmail, guestPhone]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: '#666' }}>
        Loading live tracking data...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ color: '#e23744' }}>Order Not Found</h2>
        <p style={{ margin: '15px 0' }}>{error || 'The specified order could not be retrieved from the database.'}</p>
        {(!emailParam || !phoneParam) && (
          <div style={{ marginTop: '20px' }}>
            <p>Please provide the email and phone number used when placing the order to continue tracking.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              <input
                type="email"
                placeholder="Email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '220px' }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '180px' }}
              />
              <button
                className="btn-back-menu"
                onClick={() => {
                  setSubmittingGuest(true);
                  fetchOrderStatus(guestEmail, guestPhone);
                }}
                disabled={submittingGuest || !guestEmail || !guestPhone}
                style={{ height: '42px' }}
              >
                Verify & Track
              </button>
            </div>
          </div>
        )}
        <Link to="/menu" className="btn-back-menu" style={{ display: 'inline-block', marginTop: '10px' }}>Return to Gourmet Menu</Link>
      </div>
    );
  }

  // Calculate timeline states
  const isPlaced = order.status === 'Placed';
  const isPreparing = order.status === 'Preparing';
  const isOut = order.status === 'Out for Delivery';
  const isDelivered = order.status === 'Delivered';

  let progressWidth = '0%';
  if (isPreparing) progressWidth = '33%';
  else if (isOut) progressWidth = '66%';
  else if (isDelivered) progressWidth = '100%';

  const formatEta = (minutes) => {
    if (minutes <= 0) return 'Arriving shortly';
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  };

  return (
    <div className="tracker-page-wrapper">
      <div className="tracker-top-row">
        <div className="tracker-container">
          <h1>Live Order Tracking</h1>
          <div className="order-meta-row">
            <div className="order-id-label" id="orderIdText">Order ID: {orderId}</div>
            <div className="eta-chip">Estimated Arrival: {formatEta(order.trackingInfo?.etaMinutes)}</div>
          </div>

          {/* Visual Tracking Progress */}
          <div className="timeline">
          <div className="progress-bar-fill" id="progressBarFill" style={{ width: progressWidth }}></div>
          
          <div className={`timeline-step ${isPlaced ? 'active' : (isPreparing || isOut || isDelivered ? 'completed' : '')}`} id="step1">
            <div className="step-icon-circle">
              <i className="ion-ios-paper-outline"></i>
            </div>
            <div className="step-title">Placed</div>
          </div>
          
          <div className={`timeline-step ${isPreparing ? 'active' : (isOut || isDelivered ? 'completed' : '')}`} id="step2">
            <div className="step-icon-circle">
              <i className="ion-ios-nutrition-outline"></i>
            </div>
            <div className="step-title">Preparing</div>
          </div>
          
          <div className={`timeline-step ${isOut ? 'active' : (isDelivered ? 'completed' : '')}`} id="step3">
            <div className="step-icon-circle">
              <i className="ion-ios-speedometer-outline"></i>
            </div>
            <div className="step-title">On The Way</div>
          </div>
          
          <div className={`timeline-step ${isDelivered ? 'active' : ''}`} id="step4">
            <div className="step-icon-circle">
              <i className="ion-ios-checkmark-empty"></i>
            </div>
            <div className="step-title">Delivered</div>
          </div>
        </div>

        {/* Order details summary */}
        <div className="info-card">
          <div className="info-header">Order Summary</div>
          <div className="info-row">
            <span className="info-label">Customer Name:</span>
            <span id="summaryName">{order.customerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Delivery Address:</span>
            <span id="summaryAddress">{order.address}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Restaurant:</span>
            <span id="summaryRestaurant">{order.restaurantName || 'Omnifood Marketplace'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Restaurant Owner:</span>
            <span id="summaryOwner">{order.restaurantOwnerName || 'Marketplace Team'}</span>
          </div>
        </div>

        {/* Rider Assignment Card */}
        <div className="info-card" id="riderCard">
          <div className="info-header">Delivery Partner Details</div>
          <div id="riderCardContent">
            {order.deliveryPartner ? (
              <>
                <div className="info-row">
                  <span className="info-label">Partner Name:</span>
                  <span>{order.deliveryPartner.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Mobile Number:</span>
                  <span>{order.deliveryPartner.phone || 'Not Provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email Profile:</span>
                  <span>{order.deliveryPartner.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Live Distance:</span>
                  <span>{order.trackingInfo?.distanceToCustomer?.toFixed(1)} km</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Current Speed:</span>
                  <span>{order.trackingInfo?.driverSpeed} km/h</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Route Status:</span>
                  <span>{order.trackingInfo?.routeStatus}</span>
                </div>
              </>
            ) : (
              <div>
                <span className="rider-pulse"></span>
                <span style={{ color: '#aaa', fontWeight: 300 }}>Waiting for restaurant to assign a delivery partner...</span>
              </div>
            )}
          </div>
        </div>

        <div className="tracking-layout">
          <div className="tracking-map-panel">
            <div className="map-panel-header">Rider Location Map</div>
            <div className="map-frame">
              {order.deliveryPartner && order.deliveryPartner.lat != null && order.deliveryPartner.lng != null ? (
                <MapContainer
                  center={[order.deliveryPartner.lat, order.deliveryPartner.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%', borderRadius: '18px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[order.deliveryPartner.lat, order.deliveryPartner.lng]} icon={riderIcon}>
                    <Popup>
                      {order.deliveryPartner.name} is nearby. Current status: {order.trackingInfo?.routeStatus || 'Tracking on route'}.
                    </Popup>
                  </Marker>
                  <Marker position={[order.coords.shopLat, order.coords.shopLng]} icon={pickupIcon}>
                    <Popup>Restaurant pickup location</Popup>
                  </Marker>
                  <Marker position={[order.coords.customerLat, order.coords.customerLng]} icon={dropoffIcon}>
                    <Popup>Delivery address</Popup>
                  </Marker>
                  <Polyline
                    positions={[
                      [order.coords.shopLat, order.coords.shopLng],
                      [order.deliveryPartner.lat, order.deliveryPartner.lng],
                      [order.coords.customerLat, order.coords.customerLng],
                    ]}
                    pathOptions={{ color: '#1e90ff', weight: 3, dashArray: '8,6' }}
                  />
                  <MapBounds order={order} />
                </MapContainer>
              ) : (
                <div className="map-placeholder">
                  <p>No live rider coordinates available yet.</p>
                  <p>Once a delivery partner is assigned, the map will show their location instantly.</p>
                </div>
              )}
            </div>
          </div>

          <div className="tracking-info-panel">
            <div className="info-card sticky-panel">
              <div className="info-header">Delivery Partner Profile</div>
              {order.deliveryPartner ? (
                <>
                  <div className="profile-row">
                    <div>
                      <span className="info-label">Name</span>
                      <div className="profile-value">{order.deliveryPartner.name}</div>
                    </div>
                    <div>
                      <span className="info-label">Vehicle</span>
                      <div className="profile-value">{order.deliveryPartner.vehicle || 'Standard Bike'}</div>
                    </div>
                  </div>
                  <div className="profile-row">
                    <div>
                      <span className="info-label">Phone</span>
                      <div className="profile-value">{order.deliveryPartner.phone || 'Not available'}</div>
                    </div>
                    <div>
                      <span className="info-label">Email</span>
                      <div className="profile-value">{order.deliveryPartner.email || 'Not available'}</div>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Current Location</span>
                    <span>{order.deliveryPartner.lat != null && order.deliveryPartner.lng != null ? `${order.deliveryPartner.lat.toFixed(5)}, ${order.deliveryPartner.lng.toFixed(5)}` : 'Pending'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Estimated Distance</span>
                    <span>{order.trackingInfo?.distanceToCustomer != null ? `${order.trackingInfo.distanceToCustomer.toFixed(1)} km` : 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Speed</span>
                    <span>{order.trackingInfo?.driverSpeed != null ? `${order.trackingInfo.driverSpeed} km/h` : 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Route Status</span>
                    <span>{order.trackingInfo?.routeStatus || 'Preparing route'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Last Updated</span>
                    <span>{order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString() : 'Just now'}</span>
                  </div>
                </>
              ) : (
                <div className="info-row">
                  <span className="info-label">Assigning Rider</span>
                  <span>We are waiting for a delivery partner to be matched with your order.</span>
                </div>
              )}
            </div>

            <div className="info-card">
              <div className="info-header">Order Summary</div>
              <div className="info-row">
                <span className="info-label">Customer Name:</span>
                <span id="summaryName">{order.customerName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Delivery Address:</span>
                <span id="summaryAddress">{order.address}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Restaurant:</span>
                <span id="summaryRestaurant">{order.restaurantName || 'Omnifood Marketplace'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Restaurant Owner:</span>
                <span id="summaryOwner">{order.restaurantOwnerName || 'Marketplace Team'}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">Quick Links</div>
              <Link to="/menu" className="btn-back-menu">Return to Gourmet Menu</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default TrackOrder;
