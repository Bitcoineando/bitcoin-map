export interface Building {
  id: string;
  name: string;
  path?: string;
  subsystem: string;
  loc: number;
  classes?: number;
  functions?: number;
  enums?: number;
}

export interface District {
  id: string;
  name: string;
  color: string;
  position: [number, number];
  size: [number, number];
  buildingCount: number;
}

export interface Dependency {
  from: string;
  to: string;
}

export interface JourneyStop {
  buildingId: string;
  function: string;
  annotation: string;
}

export interface Journey {
  id: string;
  name: string;
  description: string;
  color: string;
  stops: JourneyStop[];
}

export interface VersionInfo {
  version: string;
  date: string;
  label: string;
  era: string;
  fileCount: number;
  depCount: number;
  description: string;
}

export interface VersionData {
  version: string;
  github_base: string;
  districts: District[];
  buildings: Building[];
  dependencies: Dependency[];
}
