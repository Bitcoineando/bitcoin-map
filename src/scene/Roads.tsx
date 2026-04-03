import { useMemo } from 'react';
import * as THREE from 'three';
import { dependencies } from '../data/city-data';
import { getBuildingPosition } from '../layout';

export function Roads({ hiddenBuildingIds }: { hiddenBuildingIds: Set<string> }) {
  const geometry = useMemo(() => {
    const points: number[] = [];

    for (const dep of dependencies) {
      if (hiddenBuildingIds.has(dep.from) || hiddenBuildingIds.has(dep.to)) continue;

      const from = getBuildingPosition(dep.from);
      const to = getBuildingPosition(dep.to);
      if (!from || !to) continue;

      points.push(from.position[0], 0.02, from.position[2]);
      points.push(to.position[0], 0.02, to.position[2]);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [hiddenBuildingIds]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.06} />
    </lineSegments>
  );
}
