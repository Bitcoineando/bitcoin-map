import { useState, useRef } from 'react';
import { Text } from '@react-three/drei';
import type { Mesh } from 'three';
import type { BuildingPosition } from '../layout';
import { useVersionStore } from '../version-store';
import { useStore } from '../store';

interface Props {
  bp: BuildingPosition;
  isOnJourney: boolean;
  isCurrentStop: boolean;
  journeyActive: boolean;
  isConnected: boolean;
  hasSelection: boolean;
}

export function BuildingMesh({ bp, isOnJourney, isCurrentStop, journeyActive, isConnected, hasSelection }: Props) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);
  const selectBuilding = useStore((s) => s.selectBuilding);
  const selectedBuilding = useStore((s) => s.selectedBuilding);

  const buildings = useVersionStore((s) => s.buildings);
  const building = buildings.find((b) => b.id === bp.id);
  const isSelected = selectedBuilding === bp.id;

  // Determine opacity/brightness
  let opacity = 1;
  let emissiveIntensity = 0;

  if (journeyActive) {
    // Journey mode: highlight journey stops
    if (isCurrentStop) {
      emissiveIntensity = 0.4;
    } else if (isOnJourney) {
      emissiveIntensity = 0.1;
    } else {
      opacity = 0.15;
    }
  } else if (hasSelection) {
    // Selection mode: highlight selected + connected
    if (isSelected) {
      emissiveIntensity = 0.4;
    } else if (isConnected) {
      emissiveIntensity = 0.2;
      opacity = 0.9;
    } else {
      opacity = 0.15;
    }
  }

  if (hovered && !isSelected) emissiveIntensity = Math.max(emissiveIntensity, 0.2);

  // Show label for: hovered, selected, current stop, or connected buildings
  const showLabel = hovered || isSelected || isCurrentStop || (hasSelection && isConnected);

  return (
    <group position={bp.position}>
      {/* Building box */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => {
          e.stopPropagation();
          selectBuilding(isSelected ? null : bp.id);
        }}
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

      {/* Label */}
      {showLabel && building && (
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
