import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { City } from './scene/City';
import { JourneyPanel } from './ui/JourneyPanel';
import { BuildingInfo } from './ui/BuildingInfo';
import { FilterPanel } from './ui/FilterPanel';
import { VersionSelector } from './ui/VersionSelector';
import { useVersionStore } from './version-store';

export function App() {
  const loading = useVersionStore((s) => s.loading);
  const loadVersionList = useVersionStore((s) => s.loadVersionList);
  const switchVersion = useVersionStore((s) => s.switchVersion);
  const versionsLoaded = useVersionStore((s) => s.versionsLoaded);
  const currentVersion = useVersionStore((s) => s.currentVersion);

  // Load versions list and default to v28.4
  useEffect(() => {
    loadVersionList();
  }, [loadVersionList]);

  useEffect(() => {
    if (versionsLoaded && !currentVersion) {
      switchVersion('v28.4');
    }
  }, [versionsLoaded, currentVersion, switchVersion]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 120, 100], fov: 50, near: 0.1, far: 1000 }}
        style={{ background: '#0a0a0f' }}
      >
        {!loading && <City />}
      </Canvas>

      {/* UI overlays */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <JourneyPanel />
        <BuildingInfo />
        <FilterPanel />
        <VersionSelector />
      </div>
    </div>
  );
}
