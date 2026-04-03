import { useMemo } from 'react';
import * as THREE from 'three';
import { useVersionStore } from '../version-store';
import { useStore } from '../store';
import { computeBuildingPositions, buildPositionMap } from '../layout';

export function Roads({ hiddenBuildingIds }: { hiddenBuildingIds: Set<string> }) {
  const selectedBuilding = useStore((s) => s.selectedBuilding);
  const buildings = useVersionStore((s) => s.buildings);
  const districts = useVersionStore((s) => s.districts);
  const dependencies = useVersionStore((s) => s.dependencies);

  const positionMap = useMemo(
    () => buildPositionMap(computeBuildingPositions(buildings, districts)),
    [buildings, districts]
  );

  const selectedGeo = useMemo(() => {
    if (!selectedBuilding) return null;

    const points: number[] = [];

    for (const dep of dependencies) {
      if (hiddenBuildingIds.has(dep.from) || hiddenBuildingIds.has(dep.to)) continue;

      const isFrom = dep.from === selectedBuilding;
      const isTo = dep.to === selectedBuilding;
      if (!isFrom && !isTo) continue;

      const from = positionMap.get(dep.from);
      const to = positionMap.get(dep.to);
      if (!from || !to) continue;

      points.push(from.position[0], 0.05, from.position[2]);
      points.push(to.position[0], 0.05, to.position[2]);
    }

    if (points.length === 0) return null;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [selectedBuilding, hiddenBuildingIds, dependencies, positionMap]);

  if (!selectedGeo) return null;

  return (
    <lineSegments geometry={selectedGeo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
    </lineSegments>
  );
}
