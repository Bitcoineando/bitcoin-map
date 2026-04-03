import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { District } from '../data/city-data';

export function DistrictMesh({ district }: { district: District }) {
  const [x, z] = district.position;
  const [w, h] = district.size;

  const borderGeometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(w, h);
    return new THREE.EdgesGeometry(plane);
  }, [w, h]);

  return (
    <group>
      {/* Ground plane */}
      <mesh position={[x, -0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          color={district.color}
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Border */}
      <lineSegments position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]} geometry={borderGeometry}>
        <lineBasicMaterial color={district.color} transparent opacity={0.25} />
      </lineSegments>

      {/* Label */}
      <Text
        position={[x, 0.05, z - h / 2 + 1.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.4}
        color={district.color}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.35}
      >
        {district.name}
      </Text>
    </group>
  );
}
