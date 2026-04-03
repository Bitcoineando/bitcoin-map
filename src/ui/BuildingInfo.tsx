import { buildings } from '../data/city-data';
import { useStore } from '../store';

export function BuildingInfo() {
  const selectedBuilding = useStore((s) => s.selectedBuilding);
  const selectBuilding = useStore((s) => s.selectBuilding);

  if (!selectedBuilding) return null;

  const building = buildings.find((b) => b.id === selectedBuilding);
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
        <span style={styles.label}>Subsystem</span>
        <span style={styles.value}>{building.subsystem}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Lines</span>
        <span style={styles.value}>{building.loc.toLocaleString()}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 260,
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
};
