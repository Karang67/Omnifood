import { useFeature } from '../context/FeatureContext';

const FeatureGuard = ({ slug, children, mode = 'hidden', fallback = null }) => {
  const feature = useFeature(slug);

  if (!feature.enabled) {
    if (mode === 'maintenance') {
      return <div className="feature-guard-maintenance">Feature unavailable</div>;
    }
    if (mode === 'disabled') {
      return (
        <div style={{ position: 'relative', opacity: 0.6, pointerEvents: 'none' }}>
          {children}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11, 15, 25, 0.28)', borderRadius: '8px' }} />
        </div>
      );
    }
    return fallback;
  }

  if (!feature.visible) {
    return fallback;
  }

  if (feature.readOnly) {
    return (
      <div style={{ position: 'relative' }}>
        {children}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11, 15, 25, 0.14)', borderRadius: '8px' }} />
      </div>
    );
  }

  return children;
};

export default FeatureGuard;
