# Bitcoin Map — Performance Considerations

## Scale

Bitcoin Core `src/` contains roughly:
- ~800 `.cpp` files
- ~700 `.h` files
- ~1500 files total
- Thousands of `#include` relationships

Not all of these should be buildings. We need to filter.

## File Filtering Strategy

### Tier 1: Always shown (~100-150 files)
- Files with >100 LOC
- Files that are stops on any journey
- Files with >5 direct dependents

These are the "real" buildings in the city.

### Tier 2: Shown when zoomed into a district (~300 files)
- Smaller implementation files
- Less connected headers

These appear as smaller dots/markers when you zoom into a district. They don't need full building geometry.

### Tier 3: Never shown as buildings (~1000+ files)
- Internal headers with only declarations
- Test files
- Build system files
- Auto-generated files

These exist in the data (for dependency accuracy) but have no visual representation.

This keeps the city at ~100-150 buildings at overview level — very manageable for Three.js and for human comprehension.

## Three.js Performance

### Instanced Rendering

All buildings of the same shape type (box, cylinder, slab) use a single `InstancedMesh`. Instead of 150 draw calls, we have 3.

```typescript
const boxMesh = new THREE.InstancedMesh(boxGeometry, material, boxCount);
// Set per-instance transform and color
```

### Level of Detail (LOD)

- **Far:** Buildings are flat colored boxes, no labels, no edges
- **Medium:** Labels appear, edges visible on buildings
- **Close:** Full detail, function-level labels visible

Three.js LOD groups handle this automatically based on camera distance.

### Line Rendering

Dependency lines use `THREE.LineSegments` with a single buffer geometry (not individual `Line` objects). This renders thousands of lines in one draw call.

Journey paths use `THREE.TubeGeometry` for the colored trails — slightly heavier but there are only a few of these.

### Target Performance

- 60fps on a 2020 MacBook with integrated GPU
- <2 second initial load (pre-parsed JSON is ~500KB gzipped)
- <16ms frame time during orbit/zoom

This should be easily achievable with <200 objects and instanced rendering.

## Parser Performance

- Regex-based parsing of 1500 files: <5 seconds
- Tree-sitter parsing: <30 seconds
- Git metadata extraction: <10 seconds

Parser runs once, output is cached. Not a concern.

## Bundle Size

| Dependency          | Size (gzipped) |
|---------------------|----------------|
| React + ReactDOM    | ~40KB          |
| Three.js            | ~150KB         |
| @react-three/fiber  | ~30KB          |
| @react-three/drei   | ~20KB (treeshaken) |
| Syntax highlighter  | ~50KB          |
| Zustand             | ~2KB           |
| city-data.json      | ~500KB         |
| **Total**           | **~800KB**     |

Under 1MB total. Fine for a desktop-targeted web app.
