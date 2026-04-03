import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { useVersionStore } from '../version-store';
import type { BuildingPosition } from '../layout';

export function CameraRig({ positionMap }: { positionMap: Map<string, BuildingPosition> }) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const activeJourney = useStore((s) => s.activeJourney);
  const currentStop = useStore((s) => s.currentStop);
  const cameraTarget = useStore((s) => s.cameraTarget);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const journeys = useVersionStore((s) => s.journeys);

  const targetPosition = useRef(new THREE.Vector3(0, 120, 100));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, -20));
  const animating = useRef(false);

  // Fly to journey stop
  useEffect(() => {
    if (!activeJourney) return;
    const journey = journeys.find((j) => j.id === activeJourney);
    if (!journey) return;
    const stop = journey.stops[currentStop];
    if (!stop) return;
    const bp = positionMap.get(stop.buildingId);
    if (!bp) return;

    const [x, , z] = bp.position;
    targetPosition.current.set(x + 12, 15, z + 12);
    targetLookAt.current.set(x, bp.dimensions[1] / 2, z);
    animating.current = true;
  }, [activeJourney, currentStop, journeys, positionMap]);

  // Fly to clicked building
  useEffect(() => {
    if (!cameraTarget) return;
    const bp = positionMap.get(cameraTarget);
    if (!bp) return;

    const [x, , z] = bp.position;
    targetPosition.current.set(x + 10, 12, z + 10);
    targetLookAt.current.set(x, bp.dimensions[1] / 2, z);
    animating.current = true;
    setCameraTarget(null);
  }, [cameraTarget, setCameraTarget, positionMap]);

  useFrame(() => {
    if (!animating.current) return;

    camera.position.lerp(targetPosition.current, 0.03);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.03);
      controlsRef.current.update();
    }

    if (camera.position.distanceTo(targetPosition.current) < 0.1) {
      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      panSpeed={1.5}
      minDistance={3}
      maxDistance={300}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  );
}
