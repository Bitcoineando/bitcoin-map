import { useEffect } from 'react';
import { journeys } from '../data/city-data';
import { useStore } from '../store';

export function JourneyPanel() {
  const activeJourney = useStore((s) => s.activeJourney);
  const currentStop = useStore((s) => s.currentStop);
  const startJourney = useStore((s) => s.startJourney);
  const exitJourney = useStore((s) => s.exitJourney);
  const nextStop = useStore((s) => s.nextStop);
  const prevStop = useStore((s) => s.prevStop);
  const journeyPanelOpen = useStore((s) => s.journeyPanelOpen);
  const setJourneyPanelOpen = useStore((s) => s.setJourneyPanelOpen);

  const journey = activeJourney ? journeys.find((j) => j.id === activeJourney) : null;
  const stop = journey?.stops[currentStop];

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!journey) return;
      if (e.key === 'ArrowRight' && currentStop < journey.stops.length - 1) {
        nextStop();
      } else if (e.key === 'ArrowLeft' && currentStop > 0) {
        prevStop();
      } else if (e.key === 'Escape') {
        exitJourney();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [journey, currentStop, nextStop, prevStop, exitJourney]);

  // Collapsed state — just show icon button
  if (!journeyPanelOpen && !activeJourney) {
    return (
      <button
        style={styles.iconButton}
        onClick={() => setJourneyPanelOpen(true)}
        title="Journeys"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C8 2 4 6 4 10c0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </button>
    );
  }

  return (
    <div style={styles.container}>
      {/* Journey selector (when no journey active) */}
      {!journey && (
        <div style={styles.selector}>
          <div style={styles.titleRow}>
            <span style={styles.title}>JOURNEYS</span>
            <button
              style={styles.closeBtn}
              onClick={() => setJourneyPanelOpen(false)}
            >
              &times;
            </button>
          </div>
          {journeys.map((j) => (
            <button
              key={j.id}
              style={styles.journeyButton}
              onClick={() => startJourney(j.id)}
            >
              <span style={{ ...styles.dot, backgroundColor: j.color }} />
              <div>
                <div style={styles.journeyName}>{j.name}</div>
                <div style={styles.journeyDesc}>{j.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active journey panel */}
      {journey && stop && (
        <div style={styles.activePanel}>
          <div style={styles.header}>
            <span style={{ ...styles.dot, backgroundColor: journey.color }} />
            <span style={styles.journeyTitle}>{journey.name}</span>
            <button style={styles.closeBtn} onClick={exitJourney}>
              ESC
            </button>
          </div>

          {/* Progress dots */}
          <div style={styles.progress}>
            {journey.stops.map((_, i) => (
              <span
                key={i}
                style={{
                  ...styles.progressDot,
                  backgroundColor: i <= currentStop ? journey.color : '#333',
                  transform: i === currentStop ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Stop info */}
          <div style={styles.stopNumber}>
            Stop {currentStop + 1} of {journey.stops.length}
          </div>
          <div style={{ ...styles.functionName, color: journey.color }}>{stop.function}</div>
          <div style={styles.annotation}>{stop.annotation}</div>

          {/* Nav buttons */}
          <div style={styles.nav}>
            <button
              style={{ ...styles.navBtn, opacity: currentStop === 0 ? 0.3 : 1 }}
              onClick={prevStop}
              disabled={currentStop === 0}
            >
              &larr; Prev
            </button>
            <button
              style={{
                ...styles.navBtn,
                opacity: currentStop === journey.stops.length - 1 ? 0.3 : 1,
              }}
              onClick={nextStop}
              disabled={currentStop === journey.stops.length - 1}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  iconButton: {
    position: 'absolute',
    top: 16,
    left: 16,
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
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 320,
    pointerEvents: 'auto',
  },
  selector: {
    background: 'rgba(10, 10, 15, 0.9)',
    borderRadius: 8,
    padding: 16,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#666',
    fontSize: 11,
    letterSpacing: 2,
  },
  journeyButton: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6,
    padding: 12,
    cursor: 'pointer',
    marginBottom: 6,
    textAlign: 'left',
  },
  dot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 4,
  },
  journeyName: {
    color: '#e0e0e0',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  journeyDesc: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'inherit',
  },
  activePanel: {
    background: 'rgba(10, 10, 15, 0.92)',
    borderRadius: 8,
    padding: 16,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  journeyTitle: {
    color: '#e0e0e0',
    fontSize: 13,
    flex: 1,
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    color: '#666',
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  progress: {
    display: 'flex',
    gap: 4,
    marginBottom: 14,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  stopNumber: {
    color: '#555',
    fontSize: 11,
    marginBottom: 4,
  },
  functionName: {
    fontSize: 13,
    fontFamily: 'inherit',
    marginBottom: 8,
  },
  annotation: {
    color: '#b0b0b0',
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'inherit',
    marginBottom: 14,
  },
  nav: {
    display: 'flex',
    gap: 8,
  },
  navBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#ccc',
    fontSize: 12,
    padding: '8px 0',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
