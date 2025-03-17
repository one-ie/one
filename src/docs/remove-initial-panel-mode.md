# Remove Initial Panel Mode Implementation Plan

## Overview
The codebase currently has redundant panel mode configuration with both `initialPanelMode` and `rightPanelMode`. We need to consolidate these into using only `rightPanelMode` for better maintainability and consistency.

## Files to Update

### 1. src/layouts/Layout.astro
```diff
- initialPanelMode?: "Quarter" | "Half" | "Full" | "Floating" | "Icon";
```
- Remove initialPanelMode from Props interface
- Remove data-panel-mode attribute from main-grid div
- Keep rightPanelMode as the single source of truth

### 2. src/layouts/Docs.astro
- Same changes as Layout.astro
- Update rightPanelMode default to "half"

### 3. src/layouts/RightPanel.astro
- Remove initialPanelMode prop
- Update rightPanelMode prop passing
- Remove data-panel-mode attribute

### 4. src/layouts/LeftRight.astro
- Remove initialPanelMode prop
- Remove data-panel-mode attribute
- Add rightPanelMode prop if needed

## Technical Implementation Details

1. **Panel Mode Management**
   - The `layoutStore` already handles panel mode state
   - The Right component sets data-panel-mode via useEffect
   - Mobile responsiveness is handled in layout store initialization

2. **Type System Updates**
   - Ensure consistent lowercase panel mode types
   - Update PanelMode type to match rightPanelMode options

3. **Migration Path**
   - Remove initialPanelMode completely
   - Any components using initialPanelMode should switch to rightPanelMode
   - Maintain backward compatibility with proper defaults

## Implementation Steps

1. Update Layout Files:
```typescript
// Before
interface Props {
  initialPanelMode?: "Quarter" | "Half" | "Full" | "Floating" | "Icon";
  rightPanelMode?: "hidden" | "full" | "half" | "quarter" | "floating" | "icon";
}

// After
interface Props {
  rightPanelMode?: "hidden" | "full" | "half" | "quarter" | "floating" | "icon";
}
```

2. Remove Data Attributes:
```diff
- <div data-panel-mode={initialPanelMode || "Quarter"}>
+ <div>
```

3. Update Panel Mode Handling:
```typescript
// The Right component already handles this via layoutStore
useEffect(() => {
  if (mounted && rightPanelMode) {
    layoutActions.setMode(modeMap[rightPanelMode]);
  }
}, [rightPanelMode, mounted]);
```

## Testing Requirements

1. Visual Regression:
   - Test all panel modes (full, half, quarter, floating, icon)
   - Verify transitions between modes
   - Check mobile responsiveness

2. Functionality:
   - Verify panel mode state persistence
   - Check panel mode switching
   - Test mobile breakpoint behavior

3. Edge Cases:
   - No panel mode specified
   - Invalid panel modes
   - Mobile/desktop transitions

## Next Steps

1. Switch to Code mode to implement these changes
2. Update all layout files
3. Test thoroughly across different screen sizes
4. Update any documentation referring to initialPanelMode

## Migration Note
This change is non-breaking since rightPanelMode was already the primary control mechanism. The removal of initialPanelMode simplifies the codebase without affecting functionality.