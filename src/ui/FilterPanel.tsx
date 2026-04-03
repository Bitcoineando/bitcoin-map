import { useState } from 'react';
import { districts } from '../data/city-data';
import { useStore } from '../store';

export function FilterPanel() {
  const [open, setOpen] = useState(false);
  const hiddenDistricts = useStore((s) => s.hiddenDistricts);
  const toggleDistrict = useStore((s) => s.toggleDistrict);

  if (!open) {
    return (
      <button
        style={styles.iconButton}
        onClick={() => setOpen(true)}
        title="Filter districts"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
      </button>
    );
  }

  const visibleCount = districts.filter((d) => !hiddenDistricts.has(d.id)).length;

  return (
    <div style={styles.panel}>
      <div style={styles.titleRow}>
        <span style={styles.title}>DISTRICTS</span>
        <span style={styles.count}>{visibleCount}/{districts.length}</span>
        <button style={styles.closeBtn} onClick={() => setOpen(false)}>
          &times;
        </button>
      </div>
      <div style={styles.list}>
        {districts.map((d) => {
          const hidden = hiddenDistricts.has(d.id);
          return (
            <button
              key={d.id}
              style={{
                ...styles.item,
                opacity: hidden ? 0.35 : 1,
              }}
              onClick={() => toggleDistrict(d.id)}
            >
              <span
                style={{
                  ...styles.swatch,
                  backgroundColor: hidden ? '#333' : d.color,
                }}
              />
              <span style={styles.districtName}>{d.name}</span>
              <span style={styles.districtCount}>{d.buildingCount}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  iconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 8,
    background: 'rgba(10, 10, 15, 0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
  panel: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 200,
    background: 'rgba(10, 10, 15, 0.92)',
    borderRadius: 8,
    padding: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    pointerEvents: 'auto',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  title: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 2,
    flex: 1,
  },
  count: {
    color: '#555',
    fontSize: 10,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    color: '#666',
    fontSize: 12,
    padding: '2px 6px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxHeight: 400,
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '5px 4px',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    flexShrink: 0,
  },
  districtName: {
    color: '#ccc',
    fontSize: 11,
    fontFamily: 'inherit',
    flex: 1,
    textAlign: 'left',
  },
  districtCount: {
    color: '#555',
    fontSize: 10,
    fontFamily: 'inherit',
  },
};
