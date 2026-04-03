import { useState, useRef } from 'react';
import { Text } from '@react-three/drei';
import type { Mesh } from 'three';
import type { BuildingPosition } from '../layout';
import { buildings } from '../data/city-data';
import { useStore } from '../store';

interface Props {
  bp: BuildingPosition;
  isOnJourney: boolean;
  isCurrentStop: boolean;
  journeyActive: boolean;
}

export function BuildingMesh({ bp, isOnJourney, isCurrentStop, journeyActive }: Props) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);
  const selectBuilding = useStore((s) => s.selectBuilding);
  const selectedBuilding = useStore((s) => s.selectedBuilding);

  const building = buildings.find((b) => b.id === bp.id);
  const isSelected = selectedBuilding === bp.id;

  // Determine opacity/brightness
  let opacity = 1;
  let emissiveIntensity = 0;
  if (journeyActive) {
    if (isCurrentStop) {
      emissiveIntensity = 0.4;
    } else if (isOnJourney) {
      emissiveIntensity = 0.1;
    } else {
      opacity = 0.2;
    }
  }
  if (hovered) emissiveIntensity = 0.3;
  if (isSelected) emissiveIntensity = 0.3;

  return (
    <group position={bp.position}>
      {/* Building box */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); selectBuilding(bp.id); }}
      >
        <boxGeometry args={bp.dimensions} />
        <meshStandardMaterial
          color={bp.color}
          transparent
          opacity={opacity}
          emissive={bp.color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Label — show on hover or when selected or current stop */}
      {(hovered || isSelected || isCurrentStop) && building && (
        <Text
          position={[0, bp.dimensions[1] / 2 + 0.6, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.9}
        >
          {building.name}
        </Text>
      )}

      {/* Current stop indicator */}
      {isCurrentStop && (
        <mesh position={[0, bp.dimensions[1] / 2 + 1.2, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial
            color="#facc15"
            emissive="#facc15"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
