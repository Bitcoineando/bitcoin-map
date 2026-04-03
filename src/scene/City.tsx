import { useMemo } from 'react';
import { useVersionStore } from '../version-store';
import { computeBuildingPositions, buildPositionMap } from '../layout';
import { useStore } from '../store';
import { DistrictMesh } from './District';
import { BuildingMesh } from './BuildingMesh';
import { Roads } from './Roads';
import { JourneyPaths } from './JourneyPath';
import { Traveler } from './Traveler';
import { CameraRig } from './CameraRig';

export function City() {
  const buildings = useVersionStore((s) => s.buildings);
  const districts = useVersionStore((s) => s.districts);
  const dependencies = useVersionStore((s) => s.dependencies);
  const journeys = useVersionStore((s) => s.journeys);
  const currentVersion = useVersionStore((s) => s.currentVersion);

  const activeJourney = useStore((s) => s.activeJourney);
  const currentStop = useStore((s) => s.currentStop);
  const hiddenDistricts = useStore((s) => s.hiddenDistricts);
  const selectedBuilding = useStore((s) => s.selectedBuilding);

  const allPositions = useMemo(
    () => computeBuildingPositions(buildings, districts),
    [buildings, districts]
  );

  // Expose position map for other components
  const positionMap = useMemo(() => buildPositionMap(allPositions), [allPositions]);

  // Build a set of hidden building IDs for filtering
  const hiddenBuildingIds = useMemo(() => {
    const hidden = new Set<string>();
    for (const b of buildings) {
      if (hiddenDistricts.has(b.subsystem)) hidden.add(b.id);
    }
    return hidden;
  }, [buildings, hiddenDistricts]);

  // Filter building positions by visible districts
  const buildingPositions = useMemo(() => {
    return allPositions.filter((bp) => !hiddenBuildingIds.has(bp.id));
  }, [allPositions, hiddenBuildingIds]);

  // Filter districts
  const visibleDistricts = useMemo(() => {
    return districts.filter((d) => !hiddenDistricts.has(d.id));
  }, [districts, hiddenDistricts]);

  // Connected buildings for the selected building
  const connectedIds = useMemo(() => {
    if (!selectedBuilding) return new Set<string>();
    const connected = new Set<string>();
    for (const dep of dependencies) {
      if (dep.from === selectedBuilding) connected.add(dep.to);
      if (dep.to === selectedBuilding) connected.add(dep.from);
    }
    return connected;
  }, [selectedBuilding, dependencies]);

  // Which buildings are on the active journey?
  const journeyBuildingIds = useMemo(() => {
    if (!activeJourney) return new Set<string>();
    const journey = journeys.find((j) => j.id === activeJourney);
    if (!journey) return new Set<string>();
    return new Set(journey.stops.map((s) => s.buildingId));
  }, [activeJourney, journeys]);

  const currentStopBuildingId = useMemo(() => {
    if (!activeJourney) return null;
    const journey = journeys.find((j) => j.id === activeJourney);
    if (!journey) return null;
    return journey.stops[currentStop]?.buildingId ?? null;
  }, [activeJourney, currentStop, journeys]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[30, 50, 20]} intensity={0.6} />

      {/* Districts */}
      {visibleDistricts.map((d) => (
        <DistrictMesh key={d.id} district={d} />
      ))}

      {/* Roads — only shown for selected building */}
      <Roads hiddenBuildingIds={hiddenBuildingIds} />

      {/* Journey paths */}
      <JourneyPaths positionMap={positionMap} />

      {/* Buildings */}
      {buildingPositions.map((bp) => (
        <BuildingMesh
          key={bp.id}
          bp={bp}
          isOnJourney={journeyBuildingIds.has(bp.id)}
          isCurrentStop={currentStopBuildingId === bp.id}
          journeyActive={activeJourney !== null}
          isConnected={connectedIds.has(bp.id)}
          hasSelection={selectedBuilding !== null}
        />
      ))}

      {/* Animated traveler */}
      <Traveler positionMap={positionMap} />

      {/* Camera */}
      <CameraRig positionMap={positionMap} />
    </>
  );
}
