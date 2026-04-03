import type { Building, District } from './data/types';

export interface BuildingPosition {
  id: string;
  position: [number, number, number]; // x, y (height), z
  dimensions: [number, number, number]; // width, height, depth
  color: string;
}

// Deterministic seed-based pseudo-random
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function computeBuildingPositions(buildings: Building[], districts: District[]): BuildingPosition[] {
  const districtMap = new Map<string, District>();
  for (const d of districts) {
    districtMap.set(d.id, d);
  }

  // Group buildings by subsystem
  const groups = new Map<string, Building[]>();
  for (const b of buildings) {
    const list = groups.get(b.subsystem) || [];
    list.push(b);
    groups.set(b.subsystem, list);
  }

  const positions: BuildingPosition[] = [];
  const rand = seededRandom(42);

  for (const [subsystem, blds] of groups) {
    const district = districtMap.get(subsystem);
    if (!district) continue;

    const [dx, dz] = district.position;
    const [dw, dh] = district.size;

    // Sort by LOC descending — most important in center
    const sorted = [...blds].sort((a, b) => b.loc - a.loc);

    // Place in a grid within the district
    const cols = Math.ceil(Math.sqrt(sorted.length));
    const cellW = (dw - 4) / Math.max(cols, 1);
    const cellH = (dh - 4) / Math.max(Math.ceil(sorted.length / cols), 1);

    sorted.forEach((b, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = dx - (dw / 2) + 2 + col * cellW + cellW / 2 + (rand() - 0.5) * cellW * 0.3;
      const z = dz - (dh / 2) + 2 + row * cellH + cellH / 2 + (rand() - 0.5) * cellH * 0.3;

      // Height from LOC: 1 unit per 500 LOC, min 0.5, max 12
      const height = Math.min(12, Math.max(0.5, b.loc / 500));
      const width = 1.2;
      const depth = 1.2;

      positions.push({
        id: b.id,
        position: [x, height / 2, z],
        dimensions: [width, height, depth],
        color: district.color,
      });
    });
  }

  return positions;
}

// Build a position lookup map
export function buildPositionMap(positions: BuildingPosition[]): Map<string, BuildingPosition> {
  const map = new Map<string, BuildingPosition>();
  for (const bp of positions) {
    map.set(bp.id, bp);
  }
  return map;
}
