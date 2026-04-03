import { Canvas } from '@react-three/fiber';
import { City } from './scene/City';
import { JourneyPanel } from './ui/JourneyPanel';
import { BuildingInfo } from './ui/BuildingInfo';
import { FilterPanel } from './ui/FilterPanel';

export function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 120, 100], fov: 50, near: 0.1, far: 1000 }}
        style={{ background: '#0a0a0f' }}
      >
        <City />
      </Canvas>

      {/* UI overlays */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <JourneyPanel />
        <BuildingInfo />
        <FilterPanel />
      </div>
    </div>
  );
}
