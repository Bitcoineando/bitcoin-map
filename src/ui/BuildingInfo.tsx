import { useMemo } from 'react';
import { useVersionStore } from '../version-store';
import { useStore } from '../store';

export function BuildingInfo() {
  const selectedBuilding = useStore((s) => s.selectedBuilding);
  const selectBuilding = useStore((s) => s.selectBuilding);
  const setCameraTarget = useStore((s) => s.setCameraTarget);

  const buildings = useVersionStore((s) => s.buildings);
  const dependencies = useVersionStore((s) => s.dependencies);
  const githubBase = useVersionStore((s) => s.githubBase);

  const building = selectedBuilding ? buildings.find((b) => b.id === selectedBuilding) : null;

  // Find connections
  const hiddenDistricts = useStore((s) => s.hiddenDistricts);

  const { dependsOn, dependedBy } = useMemo(() => {
    if (!selectedBuilding) return { dependsOn: [], dependedBy: [] };

    const buildingMap = new Map(buildings.map((b) => [b.id, b]));
    const on: typeof buildings = [];
    const by: typeof buildings = [];

    for (const dep of dependencies) {
      if (dep.from === selectedBuilding) {
        const b = buildingMap.get(dep.to);
        if (b && !hiddenDistricts.has(b.subsystem)) on.push(b);
      }
      if (dep.to === selectedBuilding) {
        const b = buildingMap.get(dep.from);
        if (b && !hiddenDistricts.has(b.subsystem)) by.push(b);
      }
    }

    return { dependsOn: on, dependedBy: by };
  }, [selectedBuilding, hiddenDistricts]);

  if (!building) return null;

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.name}>{building.name}</span>
        <button style={styles.close} onClick={() => selectBuilding(null)}>
          &times;
        </button>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>District</span>
        <span style={styles.value}>{building.subsystem.toUpperCase()}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Lines</span>
        <span style={styles.value}>{building.loc.toLocaleString()}</span>
      </div>
      {(building.classes ?? 0) > 0 && (
        <div style={styles.row}>
          <span style={styles.label}>Classes</span>
          <span style={styles.value}>{building.classes}</span>
        </div>
      )}
      {(building.functions ?? 0) > 0 && (
        <div style={styles.row}>
          <span style={styles.label}>Functions</span>
          <span style={styles.value}>{building.functions}</span>
        </div>
      )}

      {/* GitHub link */}
      {building.path && (
        <a
          href={`${githubBase}/${building.path}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.githubLink}
        >
          View on GitHub &rarr;
        </a>
      )}

      {/* Depends on (this file includes...) */}
      {dependsOn.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Includes ({dependsOn.length})</div>
          <div style={styles.connList}>
            {dependsOn.slice(0, 8).map((b) => (
              <button
                key={b.id}
                style={styles.connItem}
                onClick={() => { selectBuilding(b.id); setCameraTarget(b.id); }}
              >
                {b.name}
              </button>
            ))}
            {dependsOn.length > 8 && (
              <span style={styles.more}>+{dependsOn.length - 8} more</span>
            )}
          </div>
        </div>
      )}

      {/* Depended by (included by...) */}
      {dependedBy.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Included by ({dependedBy.length})</div>
          <div style={styles.connList}>
            {dependedBy.slice(0, 8).map((b) => (
              <button
                key={b.id}
                style={styles.connItem}
                onClick={() => { selectBuilding(b.id); setCameraTarget(b.id); }}
              >
                {b.name}
              </button>
            ))}
            {dependedBy.length > 8 && (
              <span style={styles.more}>+{dependedBy.length - 8} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 280,
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    background: 'rgba(10, 10, 15, 0.92)',
    borderRadius: 8,
    padding: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    pointerEvents: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    color: '#e0e0e0',
    fontSize: 13,
  },
  close: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: 16,
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#555',
    fontSize: 11,
  },
  value: {
    color: '#aaa',
    fontSize: 11,
  },
  section: {
    marginTop: 10,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  connList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  connItem: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 4,
    padding: '4px 8px',
    color: '#b0b0b0',
    fontSize: 11,
    fontFamily: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  more: {
    color: '#555',
    fontSize: 10,
    paddingTop: 2,
  },
  githubLink: {
    display: 'block',
    marginTop: 8,
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4,
    color: '#8b9cf7',
    fontSize: 11,
    fontFamily: 'inherit',
    textDecoration: 'none',
    textAlign: 'center' as const,
  },
};
