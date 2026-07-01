import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const FeatureContext = createContext(null);

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;

    async function loadFeatures() {
      try {
        const response = await fetch('/api/features/public');
        const data = await response.json();
        setFeatures(data.features || []);
      } catch (error) {
        console.error('Unable to load feature flags:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFeatures();

    socket = io({ transports: ['websocket'], autoConnect: true });
    socket.on('feature:updated', (payload) => {
      setFeatures((current) => current.map((feature) => feature.slug === payload.slug ? { ...feature, ...payload.feature } : feature));
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const value = useMemo(() => ({
    features,
    loading,
    useFeature(slug) {
      const feature = features.find((item) => item.slug === slug);
      return feature || { enabled: true, visible: true, readOnly: false, maintenance: false, beta: false, roles: [] };
    }
  }), [features, loading]);

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}

export function useFeature(slug) {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context.useFeature(slug);
}

export function useFeatureContext() {
  return useContext(FeatureContext);
}
