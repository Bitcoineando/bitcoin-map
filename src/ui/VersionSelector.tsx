import { useVersionStore } from '../version-store';
import { useStore } from '../store';

const ERA_COLORS: Record<string, string> = {
  satoshi: '#f59e0b',
  growth: '#3b82f6',
  war: '#ef4444',
  modern: '#22c55e',
};

export function VersionSelector() {
  const versions = useVersionStore((s) => s.versions);
  const currentVersion = useVersionStore((s) => s.currentVersion);
  const loading = useVersionStore((s) => s.loading);
  const switchVersion = useVersionStore((s) => s.switchVersion);
  const exitJourney = useStore((s) => s.exitJourney);
  const selectBuilding = useStore((s) => s.selectBuilding);

  if (versions.length === 0) return null;

  const handleSwitch = (version: string) => {
    if (version === currentVersion || loading) return;
    exitJourney();
    selectBuilding(null);
    switchVersion(version);
  };

  return (
    <div style={styles.container}>
      <div style={styles.timeline}>
        {versions.map((v, i) => {
          const isActive = v.version === currentVersion;
          const eraColor = ERA_COLORS[v.era] || '#666';

          return (
            <button
              key={v.version}
              style={{
                ...styles.versionBtn,
                borderColor: isActive ? eraColor : 'rgba(255,255,255,0.08)',
                background: isActive ? `${eraColor}15` : 'rgba(10,10,15,0.9)',
              }}
              onClick={() => handleSwitch(v.version)}
              title={`${v.version} — ${v.description}`}
              disabled={loading}
            >
              <span style={{ ...styles.dot, backgroundColor: eraColor, opacity: isActive ? 1 : 0.4 }} />
              <span style={{ ...styles.label, color: isActive ? '#e0e0e0' : '#666' }}>
                {v.label}
              </span>
              <span style={{ ...styles.year, color: isActive ? '#999' : '#444' }}>
                {v.date.slice(0, 4)}
              </span>
            </button>
          );
        })}
      </div>
      {loading && (
        <div style={styles.loading}>Loading...</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    pointerEvents: 'auto',
  },
  timeline: {
    display: 'flex',
    gap: 3,
    background: 'rgba(10, 10, 15, 0.92)',
    borderRadius: 8,
    padding: 4,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  versionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '6px 8px',
    border: '1px solid',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'inherit',
    minWidth: 52,
    transition: 'all 0.15s ease',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
  },
  label: {
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: 0.3,
  },
  year: {
    fontSize: 8,
  },
  loading: {
    textAlign: 'center',
    color: '#555',
    fontSize: 10,
    marginTop: 4,
  },
};
