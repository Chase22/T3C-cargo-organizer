# T3C Cargo Organiser - Architecture

## Overview

T3C Cargo Organiser is a TypeScript-based web application for distributing crates of items into containers. The application uses a modular architecture with clear separation of concerns between business logic and UI management.

## Technology Stack

- **Language**: TypeScript 5.9.3
- **Bundler**: Parcel 2.16.4
- **Target**: ES2020 (browser-based)
- **UI Framework**: Vanilla JavaScript with DOM manipulation
- **Styling**: CSS3 with modern flexbox and grid layouts

## Architecture Layers

### 1. Business Logic Layer (`main.ts`)

The business logic layer contains all domain models and the core organizer logic, completely decoupled from the UI.

#### Data Models

```typescript
interface Item {
  name: string;
  quantity: number;
}

interface ContainerItem {
  name: string;
  quantity: number;
}

interface Container {
  id: number;
  items: ContainerItem[];
  totalCrates: number;
}
```

**Item**: Represents an item type in the inventory on the left column with a name and total quantity.

**ContainerItem**: Represents an item instance within a container, tracking how many of that item are in the container.

**Container**: Represents a storage container with capacity for up to 60 crates, containing multiple items and tracking total utilization.

#### CargoOrganizer Class

The `CargoOrganizer` class manages all business logic:

**State Management**:
- `items: Item[]` - Array of available items to distribute
- `containers: Container[]` - Array of 12 containers for storing items
- `draggedItem: { item: Item; source: 'left' | number }` - Tracks the currently dragged item and its source

**Core Methods**:

- `parseInput(input: string): Item[]` - Parses input data and returns item list (currently returns mock data)
- `getItems(): Item[]` - Retrieves all available items
- `getContainers(): Container[]` - Retrieves all containers
- `getAvailableSpace(containerId: number): number` - Calculates remaining capacity in a container
- `isFull(containerId: number): boolean` - Checks if a container has reached 60 crate capacity
- `addItemToContainer(containerId: number, item: Item, quantity: number): number` - Adds items to a container, returns actual amount added (supports partial fills)
- `removeItemFromContainer(containerId: number, itemName: string, quantity: number): number` - Removes items from a container
- `setDraggedItem() / getDraggedItem()` - Manages the drag state

**Key Features**:
- Validates container capacity (60 crate max)
- Supports partial item addition (fills remaining space if full amount doesn't fit)
- Supports complete item removal and transfer between containers
- Maintains accurate total crate counts

---

### 2. UI Layer (`index.ts`)

The UI layer handles all user interactions, DOM manipulation, and visual feedback through the `UIManager` class.

#### UIManager Class

**Responsibilities**:
- Manage HTML element references
- Handle user input (parse button, keyboard shortcuts)
- Render items and containers
- Manage drag-and-drop interactions
- Update UI based on state changes

**Key Properties**:
```typescript
private organizer: CargoOrganizer;           // Business logic instance
private inputField: HTMLTextAreaElement;     // Input textarea for cargo data
private parseButton: HTMLButtonElement;      // Parse button
private mainUI: HTMLElement;                 // Main UI container
private itemsContainer: HTMLElement;         // Left column (items list)
private containersGrid: HTMLElement;         // Right column (containers grid)
```

**Event Handler References**:
```typescript
private itemsContainerDragoverHandler: ((e: DragEvent) => void) | null;
private itemsContainerDragleaveHandler: ((e: DragEvent) => void) | null;
private itemsContainerDropHandler: ((e: DragEvent) => void) | null;
```

These stored references enable proper cleanup of event listeners to prevent duplicate handler accumulation.

#### Rendering Pipeline

1. **renderUI()** - Entry point for all UI updates
   - Calls `renderItems()` and `renderContainers()`
   - Triggered after parse or any drag-drop operation

2. **renderItems()** - Renders left column items
   - Creates draggable item boxes from inventory
   - Sets up drag handlers for left-to-container transfers
   - Configures items container to accept returns from containers

3. **renderContainers()** - Renders right column containers
   - Creates 12 container boxes
   - Displays items within each container
   - Shows numeric counter (current/60 crates)
   - Applies visual states (empty, normal, warning, full)

#### Drag-and-Drop System

**Drag Sources**:
- **Left Column Items** (`source: 'left'`) - Dragging items from inventory into containers
- **Container Items** (`source: number`) - Dragging items between containers or back to inventory

**Drop Targets**:
- **Containers** - Accept items from left or other containers (respects 60 crate limit)
- **Items Container** (left column) - Accept items from containers for returning to inventory

**Drop Logic**:

```
IF source === 'left' (from inventory)
  ├─ Check available space in target container
  └─ Add items (partial if needed), reduce inventory quantity

ELSE IF source !== container.id (from another container)
  ├─ Remove items from source container
  └─ Add items to target container (partial if needed)

IF target === items-container (return to inventory)
  ├─ Remove items from source container
  └─ Restore items to inventory
```

**Visual Feedback**:
- **Hover states**: Item boxes highlight with blue background and elevation
- **Drag-over states**: Containers/items area highlight with blue border and light background
- **Full container state**: Red border, reduced opacity, disabled cursor
- **Warning state**: Yellow counter when ≤10 spaces remain

---

### 3. Presentation Layer (`index.html` + `styles.css`)

#### HTML Structure

```
app/
├── input-section
│   ├── textarea#input-field
│   └── button#parse-button
└── main-ui (hidden until parsed)
    └── layout
        ├── left-column
        │   └── items-container
        └── right-column
            └── containers-grid
```

#### CSS Architecture

**Layout**:
- Two-column responsive grid layout (1fr 2fr ratio)
- Adapts to single column on smaller screens
- Containers in 3-column grid (12 containers total)

**Component Styling**:
- **Input Section**: White card with textarea and button
- **Item Boxes**: Draggable cards with hover elevation and blue highlight
- **Container Boxes**: Dashed border containers with header and items list
- **Counter Display**: Color-coded capacity indicator (green, yellow, red)

**State Classes**:
- `.hidden` - Hide elements
- `.dragging` - Visual feedback during drag
- `.drag-over` - Visual feedback on valid drop target
- `.full` - Full container styling (red, reduced opacity)
- `.warning` - Nearly full container (yellow counter)

---

## Data Flow

### Parse to Distribution Workflow

```
1. User pastes text into textarea
2. User clicks "Parse Cargo" or presses Ctrl/Cmd+Enter
   ├─ handleParse() called
   ├─ parseInput() returns items array
   ├─ showMainUI() hides input section, shows main layout
   └─ renderUI() updates all DOM elements

2. User drags item from left to container
   ├─ dragstart event: setDraggedItem(item, 'left')
   ├─ dragover event: validate capacity, show feedback
   ├─ drop event:
   │   ├─ addItemToContainer() in organizer
   │   ├─ Update item quantity in inventory
   │   └─ renderUI() to update display

3. User drags items back from container
   ├─ dragstart event: setDraggedItem(item, containerId)
   ├─ dragover items-container: show visual feedback
   ├─ drop event:
   │   ├─ removeItemFromContainer() in organizer
   │   ├─ Restore quantity to inventory
   │   └─ renderUI() to update display
```

---

## Key Design Patterns

### 1. Separation of Concerns
- **Business Logic** (CargoOrganizer): No DOM knowledge, pure data management
- **UI Management** (UIManager): Renders and manages interactions
- **Presentation** (HTML/CSS): Structure and styling only

### 2. Event Handler Management
- Store event handler references to prevent duplicate listeners
- Remove old handlers before adding new ones during re-renders
- Prevents exponential growth of duplicate handlers

### 3. Partial Quantity Support
- When adding items to a full container, only accepts what fits
- Returns actual amount added to caller
- Enables smart distribution without data loss

### 4. Drag State Tracking
- Central drag state managed by CargoOrganizer
- Allows distinguishing between inventory and container sources
- Enables conditional drop behavior

---

## State Management

All application state is managed within the `CargoOrganizer` class:

```typescript
CargoOrganizer {
  items: Item[]              // Current inventory
  containers: Container[]    // All container states
  draggedItem: {...}        // Current drag operation
}
```

**Triggers for Re-render**:
- Parse button clicked
- Keyboard shortcut (Ctrl/Cmd + Enter)
- Item dropped in container
- Item returned from container

**UI Update Flow**:
```
User Action → Event Handler → organizer.modify() → renderUI() → DOM Update
```

---

## Container Capacity System

### Constraints
- **Maximum**: 60 crates per container
- **Enforcement**: `addItemToContainer()` method limits addition
- **Partial Fills**: If adding 100 items to a container with 50 space, only 50 are added

### Capacity Indicator
- Displays as `current/60` counter in each container header
- Color coded:
  - **Gray** (0-50 crates): Normal state
  - **Yellow** (51-59 crates): Warning state (≤10 remaining)
  - **Red** (60 crates): Full state (no more additions)

---

## Current Limitations & Future Improvements

### Current Limitations
1. **Parsing**: Currently returns mock data, not actual text parsing
2. **Persistence**: No save/load functionality
3. **Undo/Redo**: No operation history
4. **Analytics**: No tracking of distribution metrics

### Potential Enhancements
1. **Real Parsing**: Implement actual text parsing for cargo input
2. **Local Storage**: Persist distributions across sessions
3. **History**: Add undo/redo for distribution operations
4. **Export**: Export distributions as reports or CSV
5. **Validation**: Warn if items can't fit in 12 containers
6. **Optimization**: Auto-suggest optimal distribution
7. **Multi-language**: Support for localization
8. **Keyboard Navigation**: Full keyboard support for accessibility

---

## File Structure

```
src/
├── index.html           # HTML structure
├── styles.css          # Styling and layout
├── index.ts            # UI management (UIManager class)
├── main.ts             # Business logic (CargoOrganizer class)
└── tsconfig.json       # TypeScript configuration

dist/                   # Compiled output (Parcel)
package.json           # Dependencies and scripts
.parcelrc              # Bundler configuration
```

---

## Build & Development

**Development**:
```bash
npm run dev
```
Starts dev server with hot module replacement at `http://localhost:1234`

**Production**:
```bash
npm run build
```
Creates optimized bundle in `dist/` directory

**Configuration**:
- TypeScript targets ES2020
- Parcel handles bundling and tree-shaking
- CSS and JS are minified in production build

