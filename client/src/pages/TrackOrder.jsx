import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/track.css';

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);


  async function fetchOrderStatus() {
    try {
      const res = await fetch(`/api/order/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (e) {
      console.error("Failed to query live status updates:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrderStatus();

    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

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
        <p style={{ margin: '15px 0' }}>The specified order could not be retrieved from the database.</p>
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

  return (
    <div className="tracker-page-wrapper">
      <div className="tracker-container">
        <h1>Live Order Tracking</h1>
        <div className="order-id-label" id="orderIdText">Order ID: {orderId}</div>

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
            <span className="info-label">Order Items:</span>
            <span id="summaryItems" style={{ textAlign: 'right', maxWidth: '60%' }}>
              {order.items.map(item => `${item.name} (x${item.quantity})`).join(", ")}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Amount:</span>
            <span id="summaryTotal" style={{ color: '#e23744', fontWeight: 600 }}>
              ${order.totalAmount.toFixed(2)}
            </span>
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
              </>
            ) : (
              <div>
                <span className="rider-pulse"></span>
                <span style={{ color: '#aaa', fontWeight: 300 }}>Waiting for restaurant to assign a delivery partner...</span>
              </div>
            )}
          </div>
        </div>

        <Link to="/menu" className="btn-back-menu">Return to Gourmet Menu</Link>
      </div>
    </div>
  );
};

export default TrackOrder;
