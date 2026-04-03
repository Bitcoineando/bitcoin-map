import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVersionStore } from '../version-store';
import { useStore } from '../store';
import type { BuildingPosition } from '../layout';

export function Traveler({ positionMap }: { positionMap: Map<string, BuildingPosition> }) {
  const activeJourney = useStore((s) => s.activeJourney);
  const currentStop = useStore((s) => s.currentStop);

  if (!activeJourney) return null;

  return <TravelerDot journeyId={activeJourney} currentStop={currentStop} positionMap={positionMap} />;
}

function TravelerDot({ journeyId, currentStop, positionMap }: { journeyId: string; currentStop: number; positionMap: Map<string, BuildingPosition> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const journeys = useVersionStore((s) => s.journeys);
  const journey = journeys.find((j) => j.id === journeyId)!;
  const playing = useStore((s) => s.journeyPlaying);
  const setPlaying = useStore((s) => s.setPlaying);

  const targetPos = useMemo(() => {
    const stop = journey.stops[currentStop];
    if (!stop) return null;
    const bp = positionMap.get(stop.buildingId);
    if (!bp) return null;
    return new THREE.Vector3(bp.position[0], bp.dimensions[1] + 1.5, bp.position[2]);
  }, [journey, currentStop, positionMap]);

  useFrame(() => {
    if (!meshRef.current || !targetPos) return;
    const pos = meshRef.current.position;
    const dist = pos.distanceTo(targetPos);

    if (dist > 0.05) {
      pos.lerp(targetPos, 0.04);
    } else {
      pos.copy(targetPos);
      if (playing) {
        setPlaying(false);
      }
    }
  });

  if (!targetPos) return null;

  return (
    <mesh ref={meshRef} position={targetPos.clone()}>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshStandardMaterial
        color={journey.color}
        emissive={journey.color}
        emissiveIntensity={1.2}
      />
    </mesh>
  );
}
