# Zork UI Enhancement Plan

**Goal**: Create a modern, authentic text adventure experience with quality-of-life features that enhance gameplay without spoiling the authentic Zork experience.

**Target**: Desktop browser only

---

## Phase 1: Core Quality-of-Life Features

### 1.1 Autocomplete Dropdown System ⭐ HIGH PRIORITY
**Status**: 🟢 Complete
**Estimated Effort**: Medium
**Dependencies**: None (backend ready)

**Acceptance Criteria**:
- [x] Dropdown appears below input field as user types (min 2 characters)
- [x] Shows context-aware suggestions: commands, items in room, exits, inventory
- [x] Navigate suggestions with Arrow Up/Down
- [x] Select with Tab or Enter
- [x] Dismiss with Escape
- [x] Fuzzy matching works (uses existing `CommandService.getSuggestions()`)
- [x] Max 10 suggestions shown
- [x] Visual indicator for suggestion types (command/item/direction)

**Implementation Notes**:
- Hook into `GameInterface.handleKeyUp()` (line 141)
- Call `CommandProcessor.getSuggestions(input)` (already exists)
- Create new component: `AutocompleteDropdown.ts`
- Add styling in `styles.scss`
- Position dropdown absolutely below input field

**Files to Create/Modify**:
- `src/ui/AutocompleteDropdown.ts` (new)
- `src/ui/GameInterface.ts` (modify)
- `src/styles.scss` (add dropdown styles)

---

### 1.2 Context Sidebar Panel ⭐ HIGH PRIORITY
**Status**: 🟢 Complete
**Estimated Effort**: Medium

**Acceptance Criteria**:
- [x] Right sidebar shows current location context
- [x] Displays available exits with directional indicators (↑ North, → East, etc.)
- [x] Lists visible items in current scene
- [x] Shows current inventory (expandable/collapsible)
- [x] Click any item/exit to insert into command input
- [x] Collapsible with keyboard shortcut (Ctrl+B)
- [x] Responsive width (200-300px)
- [x] Updates automatically after each command

**Layout**:
```
┌──────────────────────┬─────────────┐
│   Game Output        │ LOCATION:   │
│                      │ West of House│
│                      │              │
│                      │ EXITS:       │
│                      │  ↑ North     │
│                      │  ← West      │
│                      │              │
│                      │ ITEMS HERE:  │
│                      │ • mailbox    │
│                      │ • leaflet    │
│                      │              │
│                      │ INVENTORY:   │
│                      │ • lamp (off) │
│                      └─────────────┘
```

**Implementation Notes**:
- Create new component: `ContextPanel.ts`
- Query current scene from `GameStateService`
- Parse exits from scene data
- Parse items from scene data
- Show inventory from game state
- Add toggle functionality
- Persist collapsed state in localStorage

**Files to Create/Modify**:
- `src/ui/ContextPanel.ts` (new)
- `src/ui/GameInterface.ts` (integrate panel)
- `src/index.html` (add panel container)
- `src/styles.scss` (sidebar layout and styles)

---

### 1.3 Smart Typing Animation ⭐ MEDIUM PRIORITY
**Status**: 🟢 Complete
**Estimated Effort**: Small

**Acceptance Criteria**:
- [x] Game responses appear with typewriter effect
- [x] Speed: ~20-30ms per character (fast but visible)
- [x] Press any key to skip animation and show full text instantly
- [x] Different speeds for different message types (descriptions slower, errors instant)
- [x] Can be toggled on/off in settings (infrastructure ready)
- [x] No delay for user input echo ("> take lamp" appears instantly)

**Implementation Notes**:
- Modify `GameInterface.displayMessage()` (line 241)
- Create `TypewriterEffect.ts` helper class
- Add skip mechanism (keypress listener)
- Configurable via settings (future)

**Files to Create/Modify**:
- `src/ui/TypewriterEffect.ts` (new)
- `src/ui/GameInterface.ts` (modify displayMessage)

---

## Phase 2: Enhanced Visual Feedback

### 2.1 Color-Coded Output System
**Status**: 🟢 Complete
**Estimated Effort**: Small

**Acceptance Criteria**:
- [x] Room/location names: Bright white with glow
- [x] Exits/directions: Cyan (auto-highlighted in text)
- [x] Items/objects: Yellow
- [x] Score/achievements: Bright green with glow effect
- [x] Errors: Red (already implemented)
- [x] Hints/help: Dimmed gray/italic
- [x] Success messages: Green (already implemented)
- [x] Command echo: Cyan/blue

**Implementation Notes**:
- Extend message type system in `GameInterface`
- Add CSS classes for each type
- Update command responses to use appropriate types
- Maintain green screen aesthetic

**Files to Modify**:
- `src/styles.scss` (add color classes)
- `src/ui/GameInterface.ts` (extend message types)
- Commands to add type hints to their responses

---

### 2.2 Improved Visual Hierarchy
**Status**: 🟢 Complete
**Estimated Effort**: Small

**Acceptance Criteria**:
- [x] Room names displayed as headers (larger, bold, uppercase with underline)
- [x] Item lists indented with bullet points
- [x] Clear visual separation between commands (subtle borders)
- [x] Descriptions formatted with proper line breaks and spacing
- [x] Subtle dividers between messages
- [x] Better line height and readability
- [x] Distinct spacing for command echo vs responses

**Implementation Notes**:
- Update `displayMessage()` to support rich formatting
- Add markdown-style parsing (basic: **bold**, *italic*, lists)
- Update room descriptions in command responses

**Files to Modify**:
- `src/ui/GameInterface.ts`
- `src/styles.scss`

---

### 2.3 Enhanced Status Bar
**Status**: 🟢 Complete
**Estimated Effort**: Medium

**Acceptance Criteria**:
- [x] Show score with max possible (Score: 0/350)
- [x] Rank indicator (★★☆☆☆ - Beginner → Master Adventurer) with tooltip
- [x] Current location name (cyan, prominent)
- [x] Move counter
- [x] Animated score increase (flash/pulse effect)
- [x] Better visual hierarchy with colors
- [x] Enhanced styling with shadow and spacing

**Implementation Notes**:
- Extend status bar in `index.html`
- Update `GameInterface.updateGameStateDisplay()` (line 197)
- Add rank calculation based on score
- Query lamp status from inventory

**Files to Modify**:
- `src/index.html` (expand status bar)
- `src/ui/GameInterface.ts` (update display logic)
- `src/styles.scss` (status bar styling)

---

## Phase 3: Intelligent Help & Guidance

### 3.1 Context-Aware Help System
**Status**: 🔴 Not Started
**Estimated Effort**: Medium

**Acceptance Criteria**:
- [ ] Keyboard shortcut: `?` or `Ctrl+H` opens help panel
- [ ] Shows relevant commands for current location
- [ ] Lists available verbs: examine, take, open, move, etc.
- [ ] Shows available objects in current scene (no spoilers)
- [ ] Command examples: "try: examine mailbox, open mailbox"
- [ ] Never reveals puzzle solutions
- [ ] Closable overlay/modal

**Implementation Notes**:
- Create `HelpPanel.ts` component
- Query scene data for contextual suggestions
- Build command reference from registered commands
- Modal overlay design

**Files to Create/Modify**:
- `src/ui/HelpPanel.ts` (new)
- `src/ui/GameInterface.ts` (add help shortcut)
- `src/styles.scss` (modal/overlay styles)

---

### 3.2 Enhanced Command History
**Status**: 🔴 Not Started
**Estimated Effort**: Small

**Acceptance Criteria**:
- [ ] Current: Arrow Up/Down navigation (✓ already works)
- [ ] New: Ctrl+R for reverse search
- [ ] New: Type to filter history
- [ ] New: Display recent commands panel (last 10, collapsible)
- [ ] Persist history across sessions (localStorage)

**Implementation Notes**:
- Extend `GameInterface.navigateHistory()` (line 226)
- Add reverse search UI
- Add history panel component
- Save/load from localStorage

**Files to Modify**:
- `src/ui/GameInterface.ts`
- Add optional history panel to sidebar

---

### 3.3 Improved Error Messages
**Status**: 🔴 Not Started
**Estimated Effort**: Small

**Acceptance Criteria**:
- [ ] Typo detection: "Did you mean: 'take lamp'?"
- [ ] Helpful hints: "You can't see 'treasure' here. Try: look, examine"
- [ ] Direction hints: "To move, try: north, south, east, west"
- [ ] Uses existing fuzzy matching from `CommandService`

**Implementation Notes**:
- Modify `CommandService.handleUnknownCommand()` (line 272)
- Enhance error messages with suggestions
- Already has Levenshtein distance for typo detection

**Files to Modify**:
- `src/services/CommandService.ts` (improve error messages)

---

## Phase 4: Polish & Delight

### 4.1 Save/Load System
**Status**: 🔴 Not Started
**Estimated Effort**: Medium-Large

**Acceptance Criteria**:
- [ ] Auto-save every turn to localStorage
- [ ] Named save slots (3-5 slots)
- [ ] Save metadata: timestamp, location, score, moves
- [ ] Quick save: F5, Quick load: F9
- [ ] Manual save: `/save [name]` command
- [ ] Manual load: `/load [name]` command
- [ ] Export save to JSON file (download)
- [ ] Import save from JSON file (upload)
- [ ] Save manager UI panel

**Implementation Notes**:
- Create `SaveManager.ts` service
- Serialize `GameState` to JSON
- Store in localStorage with metadata
- Add save/load commands
- Create save manager UI

**Files to Create/Modify**:
- `src/services/SaveManager.ts` (new)
- `src/commands/SaveCommand.ts` (new)
- `src/commands/LoadCommand.ts` (new)
- `src/ui/SaveManagerPanel.ts` (new)

---

### 4.2 Settings Panel
**Status**: 🔴 Not Started
**Estimated Effort**: Medium

**Acceptance Criteria**:
- [ ] Keyboard shortcut: Ctrl+, or `/settings` command
- [ ] Toggle typing animation on/off
- [ ] Adjust text size (Small/Medium/Large)
- [ ] Change color theme (Green/Amber/White on Black)
- [ ] Toggle context panel visibility
- [ ] Toggle sound effects (if implemented)
- [ ] Accessibility options (high contrast, screen reader mode)
- [ ] Settings persist in localStorage

**Implementation Notes**:
- Create `SettingsPanel.ts` component
- Create `Settings.ts` service for state management
- Modal overlay design
- Apply settings dynamically

**Files to Create/Modify**:
- `src/services/Settings.ts` (new)
- `src/ui/SettingsPanel.ts` (new)
- `src/styles.scss` (theme variables and settings panel)

---

### 4.3 Easter Eggs & Special Commands
**Status**: 🔴 Not Started
**Estimated Effort**: Small (Fun!)

**Acceptance Criteria**:
- [ ] `xyzzy` - Classic Zork response
- [ ] `plugh` - Another classic
- [ ] `sudo [command]` - "You're not root in the Great Underground Empire!"
- [ ] `clear` - Clear screen
- [ ] `history` - Show command history
- [ ] `hint` - Progressive hint system (if stuck)
- [ ] `about` - Game credits and version
- [ ] Hidden messages for developers

**Implementation Notes**:
- Create special command handlers
- Add to command registry
- Keep responses in Zork's tone

**Files to Create**:
- `src/commands/EasterEggCommands.ts` (new)

---

## Phase 5: Advanced Features (Future)

### 5.1 Progressive Hint System
- Track player stuck time per location
- Offer subtle hints after 5 minutes
- More explicit hints after 10 minutes
- Never spoil complete solutions
- Player can request hints manually

### 5.2 Achievement System
- Track discovered treasures
- Track visited locations
- Track completed puzzles
- Visual achievement badges
- Shareable achievements (text-only)

### 5.3 Sound Effects (Optional)
- Keyboard click sounds
- Success chime
- Error beep
- Ambient room sounds
- Toggle on/off in settings

### 5.4 Map System (Optional, Controversial)
- Auto-mapping as you explore
- Fog of war for unvisited areas
- Completely optional/hidden
- Unlock after first playthrough?

---

## Implementation Guidelines

### Code Quality Standards
- TypeScript strict mode (no `any` types)
- 100% test coverage for new services
- Follow existing architecture (4-layer)
- Document all public APIs
- Use loglevel for logging

### UI/UX Principles
- **Preserve authenticity**: Don't spoil the Zork experience
- **Non-intrusive**: Features should enhance, not distract
- **Keyboard-first**: Every feature accessible via keyboard
- **Accessible**: ARIA labels, screen reader support
- **Fast**: No lag in typing or command execution
- **Retro aesthetic**: Maintain green screen terminal feel

### Testing Strategy
- Unit tests for all new services
- Integration tests for UI components
- Manual testing for UX flows
- Accessibility testing

---

## Progress Tracking

**Legend**:
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⏸️ Paused/Blocked

**Overall Progress**: 6/23 tasks complete (26%)

**Completed**:
- ✅ Phase 1.1: Autocomplete Dropdown System
- ✅ Phase 1.2: Context Sidebar Panel
- ✅ Phase 1.3: Smart Typing Animation
- ✅ Phase 2.1: Color-Coded Output System
- ✅ Phase 2.2: Improved Visual Hierarchy
- ✅ Phase 2.3: Enhanced Status Bar

**Phase 1 Complete!** 🎉
**Phase 2 Complete!** 🎉

**Next Steps**:
1. Phase 3.1 (Context-Aware Help) - intelligent assistance
2. Phase 3.2 (Enhanced Command History) - search and filter
3. Phase 4.1 (Save/Load System) - game state persistence

---

## Notes & Ideas

- Consider adding a "purist mode" that disables all modern features
- Could add telemetry (optional, anonymous) to see which features are used
- Think about mobile responsiveness later (currently desktop-only)
- Consider adding multiplayer/co-op mode (very future)
- Integration with Claude Code for hints? (AI-powered hint system)

---

**Last Updated**: 2025-10-01
**Version**: 1.0
**Branch**: ui-enhancement
