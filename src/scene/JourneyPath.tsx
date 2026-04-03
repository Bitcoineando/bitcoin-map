import { useMemo } from 'react';
import * as THREE from 'three';
import { journeys } from '../data/city-data';
import { getBuildingPosition } from '../layout';
import { useStore } from '../store';

export function JourneyPaths() {
  return (
    <>
      {journeys.map((journey) => (
        <JourneyPath key={journey.id} journeyId={journey.id} />
      ))}
    </>
  );
}

function JourneyPath({ journeyId }: { journeyId: string }) {
  const journey = journeys.find((j) => j.id === journeyId)!;
  const activeJourney = useStore((s) => s.activeJourney);
  const isActive = activeJourney === journeyId;

  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];

    for (const stop of journey.stops) {
      const bp = getBuildingPosition(stop.buildingId);
      if (!bp) continue;
      points.push(new THREE.Vector3(bp.position[0], 0.05, bp.position[2]));
    }

    // Create a smooth curve through the stops
    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, false);
    return tubeGeo;
  }, [journey.stops]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={journey.color}
        transparent
        opacity={isActive ? 0.6 : 0.15}
        emissive={journey.color}
        emissiveIntensity={isActive ? 0.4 : 0.05}
      />
    </mesh>
  );
}
