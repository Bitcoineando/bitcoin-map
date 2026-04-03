import { useMemo } from 'react';
import * as THREE from 'three';
import { dependencies } from '../data/city-data';
import { getBuildingPosition } from '../layout';
import { useStore } from '../store';

export function Roads({ hiddenBuildingIds }: { hiddenBuildingIds: Set<string> }) {
  const selectedBuilding = useStore((s) => s.selectedBuilding);

  // Build a quick lookup: which buildings connect to/from the selected one?
  const { selectedGeo, connectedIds } = useMemo(() => {
    if (!selectedBuilding) {
      return { selectedGeo: null, connectedIds: new Set<string>() };
    }

    const points: number[] = [];
    const connected = new Set<string>();

    for (const dep of dependencies) {
      if (hiddenBuildingIds.has(dep.from) || hiddenBuildingIds.has(dep.to)) continue;

      const isFrom = dep.from === selectedBuilding;
      const isTo = dep.to === selectedBuilding;
      if (!isFrom && !isTo) continue;

      const from = getBuildingPosition(dep.from);
      const to = getBuildingPosition(dep.to);
      if (!from || !to) continue;

      points.push(from.position[0], 0.05, from.position[2]);
      points.push(to.position[0], 0.05, to.position[2]);
      connected.add(isFrom ? dep.to : dep.from);
    }

    if (points.length === 0) return { selectedGeo: null, connectedIds: connected };

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return { selectedGeo: geo, connectedIds: connected };
  }, [selectedBuilding, hiddenBuildingIds]);

  if (!selectedGeo) return null;

  return (
    <lineSegments geometry={selectedGeo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
    </lineSegments>
  );
}
