# Bitcoin Map — Interaction Design

## Camera

### Default: Orbit

- **Left-click drag:** Rotate around the city center
- **Scroll:** Zoom in/out
- **Right-click drag:** Pan
- Camera stays above ground (no flipping upside down)
- Smooth damping on all movements

### Fly-to

When the user clicks a building or activates a journey stop, the camera smoothly animates to frame the target:

- Duration: ~1 second
- Easing: ease-in-out
- Framing: target building centered, zoomed to show it plus its immediate neighbors

### Journey Follow

When following a journey, the camera animates along the path between stops:

- Camera flies from stop to stop, following the road
- Slight elevation above the road (bird's eye of the path, not first-person)
- User can interrupt at any time with mouse input — camera control returns to orbit mode, journey pauses

## Building Interaction

### Hover

- Building brightens
- Label appears above it (file name)
- Connected roads brighten (showing dependencies)
- Tooltip shows: file name, LOC, subsystem

### Click

- Code panel opens on the right side of the screen
- Shows the file's key classes and functions (not full source — summary view)
- Each function is clickable to expand and show the code
- The building gets a selection outline
- Connected buildings are highlighted, others dim slightly

### Double-click

- Zoom into the building — camera flies close
- Code panel expands to full view
- Shows complete file with syntax highlighting

## Journey Interaction

### Starting a Journey

Two ways:
1. **Click a journey path** on the ground in the city view
2. **Select from the sidebar** journey list

### During a Journey

```
┌──────────────────────────────────────────────────┐
│                                                  │
│            3D City View                          │
│      (dimmed except journey path)                │
│                                                  │
│           ● ─── ● ─── ●                         │
│          stop1  stop2  [current]                 │
│                                                  │
│                                                  │
├──────────────────┬───────────────────────────────┤
│  Journey Panel   │       Code Panel              │
│                  │                               │
│  ▶ Life of a Tx  │  // validation.cpp            │
│                  │  bool AcceptToMemoryPool(...)  │
│  Stop 5/10       │  {                            │
│  AcceptToMemory  │      // Check inputs exist    │
│  Pool            │      ...                      │
│                  │  }                            │
│  "This is the    │                               │
│  main gate..."   │                               │
│                  │                               │
│  [← Prev] [Next →]                              │
└──────────────────┴───────────────────────────────┘
```

- **Left/right arrow keys** or **Next/Prev buttons** to move between stops
- **Escape** to exit the journey (camera returns to overview)
- **Click any building** outside the journey to pause and explore
- **"Resume" button** appears when a journey is paused

### Progress Indicator

A simple breadcrumb trail at the bottom of the journey panel:

```
● ● ● ● ◉ ○ ○ ○ ○ ○
1 2 3 4 5 6 7 8 9 10
```

Filled dots = visited. Ring = current. Empty = upcoming.

## Search

### Trigger

- Click the search icon in the top bar
- Press `/` or `Ctrl+K` anywhere

### Behavior

- Fuzzy search across file names, class names, function names
- Results show the subsystem color dot next to each result
- Click a result → camera flies to that building, building is selected
- Search is always available, even during a journey (which pauses)

### Results format

```
🔵 validation.cpp → AcceptToMemoryPool()
🟡 net_processing.cpp → ProcessMessage()
🟢 wallet/spend.cpp → CreateTransaction()
```

(Color dots use the subsystem colors, not emoji — emoji used here for illustration)

## Keyboard Shortcuts

| Key          | Action                              |
|-------------|--------------------------------------|
| `/`         | Open search                          |
| `Escape`    | Close panel / exit journey / deselect|
| `←` `→`    | Previous / next journey stop         |
| `Space`     | Pause / resume journey animation     |
| `R`         | Reset camera to default position     |
| `L`         | Toggle legend                        |
| `1-9`       | Quick-jump to journey stop N         |

## Responsive Design

- **Desktop (>1024px):** Full layout with side panels
- **Tablet (768-1024px):** Panels become bottom sheets
- **Mobile (<768px):** Simplified — 2D minimap mode with journey narration. 3D is optional.

The primary target is desktop. Tablet is nice-to-have. Mobile is a stretch goal.
