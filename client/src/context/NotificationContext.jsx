import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item = {
      id,
      type: notification.type || 'info',
      message: notification.message || '',
      duration: notification.duration || 4000
    };

    setNotifications((prev) => [...prev, item]);

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, item.duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
      {children}
      <div className="toast-area">
        {notifications.map((notification) => (
          <div key={notification.id} className={`toast-item ${notification.type}`}>
            <span>{notification.message}</span>
            <button type="button" className="toast-close" onClick={() => removeNotification(notification.id)}>&times;</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
