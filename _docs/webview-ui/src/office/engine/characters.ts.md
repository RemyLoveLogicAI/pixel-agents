<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/office/engine/characters.ts",
  "source_hash": "71cc1ee86d298e02d4f7e130fb3f03af48a9a1a6bf345852957746992f36c1cd",
  "last_updated": "2026-02-26T19:10:26.576742+00:00",
  "tokens_used": 15760,
  "complexity_score": 4,
  "estimated_review_time_minutes": 15,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../../README.md) > [webview-ui](../../../README.md) > [src](../../README.md) > [office](../README.md) > [engine](./README.md) > **characters**

---

# characters.ts

> **File:** `webview-ui/src/office/engine/characters.ts`

![Complexity: Medium](https://img.shields.io/badge/Complexity-Medium-yellow) ![Review Time: 15min](https://img.shields.io/badge/Review_Time-15min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Usage Examples](#usage-examples)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

This module implements runtime behavior for in-world characters (agents) in a tile-based office UI. It exposes createCharacter(...) to construct a Character with sensible defaults, updateCharacter(...) to advance per-frame timers, animation frames and movement, and getCharacterSprite(...) to map a character's current state and direction into SpriteData for rendering. Characters use a small state machine (CharacterState: TYPE, IDLE, WALK) and are mutable objects intended to be updated each frame by a central game loop.

updateCharacter handles animation timing (frameTimer/FRAME_DURATION constants), movement interpolation between tile centers using moveProgress and TILE_SIZE, and invokes findPath when a character begins walking, wanders, or needs to return to a seat. Seat-related behavior supports activating/deactivating agents: when active, an agent will attempt to path to its seat, sit for a randomized rest duration, or wander to random walkable tiles when idle. Utility helpers (tileCenter, directionBetween, randomRange, randomInt) and several numeric constants drive timing, speeds, and randomized pauses. The implementation assumes valid tileMap, blockedTiles, and seats inputs and favors in-place mutation over defensive error-handling; callers should ensure the environment and findPath contract are correct.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../types.js](../../types.js.md) | Imports runtime values CharacterState, Direction, TILE_SIZE and (via `import type`) the TypeScript types Character, Seat, SpriteData and TileType as TileTypeVal. CharacterState and Direction are used in updateCharacter and getCharacterSprite to drive the state machine and choose sprite rows; TILE_SIZE is used by tileCenter and movement interpolation; types are used to type function parameters/returns. |
| [../sprites/spriteData.js](../../sprites/spriteData.js.md) | Imported as `import type { CharacterSprites }` and used only for typing getCharacterSprite's sprites parameter (CharacterSprites describes the nested sprite arrays accessed by direction and frame in getCharacterSprite). |
| [../layout/tileMap.js](../../layout/tileMap.js.md) | Imports the function findPath which is called from updateCharacter to compute a path (array of {col,row}) between tiles when a character begins walking, when selecting a wander target, when returning to a seat, and when repathing after activation during walking. |
| [../../constants.js](../../../constants.js.md) | Imports multiple numeric constants that control animation and movement timing (WALK_SPEED_PX_PER_SEC, WALK_FRAME_DURATION_SEC, TYPE_FRAME_DURATION_SEC), wandering behavior (WANDER_PAUSE_MIN_SEC, WANDER_PAUSE_MAX_SEC, WANDER_MOVES_BEFORE_REST_MIN/MAX), and seat rest durations (SEAT_REST_MIN_SEC/SEAT_REST_MAX_SEC). These constants drive frame advancement, moveProgress increments, randomized pauses, and rest durations in updateCharacter. |

## 📁 Directory

This file is part of the **engine** directory. View the [directory index](_docs/webview-ui/src/office/engine/README.md) to see all files in this module.

## Architecture Notes

- State machine pattern: updateCharacter switches on CharacterState (TYPE, IDLE, WALK) and mutates the Character object in place — there are explicit transitions between typing, idle and walking states with timers and path assignment.
- Movement interpolation: Characters move by incrementing moveProgress by (WALK_SPEED_PX_PER_SEC / TILE_SIZE) * dt and interpolating x/y between tile centers using tileCenter. When moveProgress >= 1 the character snaps to the next tile, tileCol/tileRow update, and path array is shifted.
- Pathfinding integration and repathing: findPath is used whenever a character starts walking (to a seat or wander target) and also to repath mid-walk if the character becomes active and needs to head to their seat. The code assumes findPath returns an array of tile steps or an empty array if no path.
- Timers & randomness: Frame animation and behavior pauses use constants and randomized ranges (randomRange/randomInt). seatTimer uses negative values as a sentinel (commented behavior indicates -ve means 'turn just ended' to skip long rests), so callers that set seatTimer must respect that sentinel.
- No explicit error handling: The module assumes valid inputs (tileMap shape, seat entries present when seatId is set). Blocked tiles and path emptiness are handled by branching logic, but there are no thrown errors or exceptions; callers should validate tile map and blockedTiles inputs.

## Usage Examples

### Creating a character and running the per-frame update in a game loop

Create a character with createCharacter(id, palette, seatId, seat, hueShift). Add the returned Character object to your world. Each render tick call updateCharacter(ch, dt, walkableTiles, seatsMap, tileMap, blockedTiles) where dt is seconds since last frame. updateCharacter will mutate ch: advancing frameTimer, possibly setting ch.path (array of {col,row}), updating ch.x/y and ch.tileCol/tileRow while walking, and transitioning between TYPE/IDLE/WALK states. After updating, call getCharacterSprite(ch, sprites) to select the SpriteData for rendering based on ch.state, ch.dir and ch.frame (getCharacterSprite will pick typing vs reading frame using isReadingTool on ch.currentTool).

### Agent becomes active while wandering and needs to return to their seat

If a character is wandering (state IDLE or WALK) and ch.isActive becomes true and ch.seatId is set, updateCharacter will attempt to find a path to the seat (using findPath). If a path is found it assigns ch.path and transitions to WALK. If the character is mid-walk and becomes active, updateCharacter checks the last step in the current ch.path and, if it doesn't lead to the seat, computes a new path and replaces ch.path to reroute them immediately.

## Maintenance Notes

- Performance: findPath may be costly if called frequently for many characters. Consider caching paths or throttling repath attempts (currently repath occurs immediately when activation changes mid-walk).
- Determinism & testing: many behaviors use Math.random (randomRange/randomInt and random walk target selection). For deterministic unit tests inject or mock randomness or expose seeds.
- Edge cases: updateCharacter assumes tileMap and blockedTiles are consistent; findPath returning an empty array is used to indicate 'no path' or 'already at target' — ensure callers and findPath contract match. Also ensure seat lookup via seats.get(ch.seatId) handles missing seats.
- Numeric stability: moveProgress is reset to 0 after tile arrivals; floating-point drift is mitigated by snapping to tile centers when a path completes or a tile step completes.
- Future improvements: add configurable max repath frequency, introduce cancellation for long path computations, and add explicit error/log messages when findPath fails frequently for a character's seat.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/office/engine/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*


---

## Functions and Classes


#### function tileCenter

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript
function tileCenter(col: number, row: number): { x: number; y: number }
```

### Description

Implementation not visible

Implementation not visible. Only the function signature is available; no function body or logic can be inspected in the provided source snippet.

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `col` | `number` | ✅ | Column index (as declared in the signature). Exact usage and interpretation are not visible because implementation is not provided.
<br>**Constraints:** No constraints visible in the provided snippet |
| `row` | `number` | ✅ | Row index (as declared in the signature). Exact usage and interpretation are not visible because implementation is not provided.
<br>**Constraints:** No constraints visible in the provided snippet |

### Returns

**Type:** `{ x: number; y: number }`

Declared return type is an object with numeric properties x and y. The actual returned values and how they are computed are not visible because the implementation is not provided.


**Possible Values:**

- Any object matching the shape { x: number; y: number } as produced by the unseen implementation

### Usage Examples

#### Basic call with column and row indices

```typescript
const center = tileCenter(3, 5);
```

Demonstrates calling the function with numeric column and row arguments. The structure of the returned object is known from the signature, but the numeric values are determined by the hidden implementation.

### Complexity

Unknown — implementation not visible, so time and space complexity cannot be determined

### Notes

- Only the function signature was provided; the function body is not present in the input.
- All behavioral details (algorithm, computations, validations) cannot be documented without the implementation.

---



#### function directionBetween

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript
function directionBetween(fromCol: number, fromRow: number, toCol: number, toRow: number): Direction
```

### Description

Determine a single cardinal Direction (LEFT, RIGHT, UP, or DOWN) from one grid coordinate to another based on their column and row differences.


This function computes the difference in columns (dc) and rows (dr) between a destination coordinate (toCol, toRow) and a source coordinate (fromCol, fromRow). It returns a Direction value according to the following rules implemented in order: if dc > 0 return Direction.RIGHT; if dc < 0 return Direction.LEFT; if dr > 0 return Direction.DOWN; otherwise return Direction.UP. Horizontal displacement (column difference) is checked first and takes precedence over vertical displacement. If both differences are zero (same cell), the function returns Direction.UP because none of the earlier conditions match.

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `fromCol` | `number` | ✅ | Source column index (x-coordinate) used as the starting position.
<br>**Constraints:** Must be a numeric value, No explicit integer or bounds checks in implementation |
| `fromRow` | `number` | ✅ | Source row index (y-coordinate) used as the starting position.
<br>**Constraints:** Must be a numeric value, No explicit integer or bounds checks in implementation |
| `toCol` | `number` | ✅ | Destination column index (x-coordinate) used as the target position.
<br>**Constraints:** Must be a numeric value, No explicit integer or bounds checks in implementation |
| `toRow` | `number` | ✅ | Destination row index (y-coordinate) used as the target position.
<br>**Constraints:** Must be a numeric value, No explicit integer or bounds checks in implementation |

### Returns

**Type:** `Direction`

A Direction enum value indicating the cardinal direction from the source to the destination according to the implemented priority (horizontal first, then vertical).


**Possible Values:**

- Direction.RIGHT
- Direction.LEFT
- Direction.DOWN
- Direction.UP

### Usage Examples

#### Move right when destination column is greater than source column

```typescript
directionBetween(2, 5, 4, 5) // => Direction.RIGHT
```

dc = 2 so the function returns Direction.RIGHT without checking rows.

#### Move up when columns are equal and destination row is less than source row

```typescript
directionBetween(3, 4, 3, 2) // => Direction.UP
```

dc = 0 so horizontal checks fail; dr = -2 so dr > 0 is false and the function returns Direction.UP as the final fallback.

#### Same cell returns Direction.UP (per implementation)

```typescript
directionBetween(1, 1, 1, 1) // => Direction.UP
```

Both dc and dr are zero; none of the earlier conditions match, so the function falls through to return Direction.UP.

### Complexity

O(1) time complexity and O(1) space complexity

### Related Functions

- `Direction (enum)` - Returns a value from this enum; enum defines the possible cardinal directions used by the function

### Notes

- Horizontal difference (columns) is prioritized: any non-zero dc determines the result regardless of dr.
- If from and to coordinates are identical, the function returns Direction.UP due to the final return statement.
- No validation is performed on inputs; caller must ensure numeric/valid coordinates if required by the application.

---



#### function randomRange

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript
function randomRange(min: number, max: number): number
```

### Description

Returns a number computed as min + Math.random() * (max - min).


Computes a linear interpolation between min and max using Math.random(). The function multiplies Math.random() (which yields a value in the range [0, 1)) by (max - min) and then adds min, producing a value that lies in the interval [min, max) when min <= max. There is no validation of inputs; the numeric result follows JavaScript arithmetic rules (so non-finite or NaN inputs propagate accordingly).

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `min` | `number` | ✅ | Lower bound of the desired range (added to the scaled random fraction).
<br>**Constraints:** No validation performed by the function itself, Expected to be a finite number for predictable results, If min > max the result will still compute but will be outside typical ascending-range expectations |
| `max` | `number` | ✅ | Upper bound of the desired range (used to compute the span).
<br>**Constraints:** No validation performed by the function itself, Expected to be a finite number for predictable results, If max == min the function returns min (since Math.random()*(0) == 0), If max < min the returned value is min + random * (negative number), producing values <= min |

### Returns

**Type:** `number`

A numeric value computed as min + Math.random() * (max - min). Typically in [min, max) when min <= max.


**Possible Values:**

- Any number between min (inclusive) and max (exclusive) when min <= max
- Exactly min if max == min
- Values outside [min, max) if inputs are non-finite or if max < min
- NaN if any input is NaN

### Usage Examples

#### Generate a random float between 0 and 1 (equivalent to Math.random())

```typescript
randomRange(0, 1)
```

Produces a number in [0, 1).

#### Get a random value in a custom float interval

```typescript
randomRange(-5.5, 10.2)
```

Produces a floating-point number between -5.5 (inclusive) and 10.2 (exclusive).

#### When min equals max

```typescript
randomRange(3, 3)
```

Deterministically returns 3 because the span (max - min) is 0.

### Complexity

O(1) time complexity and O(1) space complexity

### Related Functions

- `Math.random` - Called by this function to produce the base random fraction in [0, 1).

### Notes

- The function does not validate that min <= max; callers should ensure correct ordering if they expect results in ascending range.
- Because Math.random() returns values in [0, 1), the produced value is in [min, max) when min < max and exactly min when min == max.
- Input values that are NaN or Infinity will propagate according to JavaScript numeric rules.
- If integer randoms are needed, callers should wrap this function with Math.floor/Math.ceil or use other integer-specific logic.

---



#### function randomInt

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript
function randomInt(min: number, max: number): number
```

### Description

Return an integer computed from min and a random fraction scaled to the inclusive range [min, max].


This function generates a pseudo-random integer by taking Math.random() (which yields a floating-point in [0, 1)), multiplying it by (max - min + 1), applying Math.floor to obtain an integer offset, and then adding min. The result is intended to be an integer in the inclusive range from min to max for the common case where max >= min. The function performs no input validation and directly returns the computed numeric result.

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `min` | `number` | ✅ | The lower bound of the target integer range; it's added to the computed offset.
<br>**Constraints:** No internal validation performed, For the intended behavior (an integer between min and max inclusive), supply max >= min, Values should be finite numbers (not NaN or Infinity) to avoid unexpected numeric results |
| `max` | `number` | ✅ | The upper bound of the target integer range; used to compute the scale of the random offset.
<br>**Constraints:** No internal validation performed, For the intended behavior (an integer between min and max inclusive), supply max >= min, Values should be finite numbers (not NaN or Infinity) to avoid unexpected numeric results |

### Returns

**Type:** `number`

A number produced by min + Math.floor(Math.random() * (max - min + 1)). Typically this is an integer in the inclusive range [min, max] when max >= min.


**Possible Values:**

- Integers from min to max inclusive when max >= min
- If max < min or non-finite inputs are provided, the numeric result may be outside the intended range or NaN/Infinity depending on inputs

### Usage Examples

#### Get a random integer between 1 and 6 (inclusive), e.g., simulating a six-sided die roll.

```typescript
randomInt(1, 6)
```

Returns an integer 1, 2, 3, 4, 5, or 6 with (approximately) equal probability.

#### Use when min and max are equal to always get that value.

```typescript
randomInt(5, 5)
```

Returns 5 because the computed range size is 1 and Math.floor(Math.random() * 1) is always 0.

### Complexity

O(1) time and O(1) space (constant-time arithmetic operations and a single random number generation).

### Related Functions

- `Math.random` - Calls; the function uses Math.random() as the source of randomness.
- `Math.floor` - Calls; the function uses Math.floor() to convert a floating-point offset into an integer offset.

### Notes

- The function does not validate inputs; calling with non-finite numbers or min > max may yield unexpected results.
- Because it uses Math.random(), the distribution is determined by the JavaScript engine's PRNG and is not cryptographically secure.
- The implementation produces inclusive upper bound by using (max - min + 1) before flooring.

---


