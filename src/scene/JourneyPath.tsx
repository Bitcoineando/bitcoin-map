import { useMemo } from 'react';
import * as THREE from 'three';
import { useVersionStore } from '../version-store';
import { useStore } from '../store';
import type { BuildingPosition } from '../layout';

export function JourneyPaths({ positionMap }: { positionMap: Map<string, BuildingPosition> }) {
  const journeys = useVersionStore((s) => s.journeys);

  return (
    <>
      {journeys.map((journey) => (
        <JourneyPath key={journey.id} journeyId={journey.id} positionMap={positionMap} />
      ))}
    </>
  );
}

function JourneyPath({ journeyId, positionMap }: { journeyId: string; positionMap: Map<string, BuildingPosition> }) {
  const journeys = useVersionStore((s) => s.journeys);
  const journey = journeys.find((j) => j.id === journeyId)!;
  const activeJourney = useStore((s) => s.activeJourney);
  const isActive = activeJourney === journeyId;

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];

    for (const stop of journey.stops) {
      const bp = positionMap.get(stop.buildingId);
      if (!bp) continue;
      points.push(new THREE.Vector3(bp.position[0], 0.05, bp.position[2]));
    }

    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, false);
    return tubeGeo;
  }, [journey.stops, positionMap]);

  // Only render when this journey is active
  if (!isActive || !geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={journey.color}
        transparent
        opacity={0.6}
        emissive={journey.color}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}
