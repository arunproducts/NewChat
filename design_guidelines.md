# xelochat - Design Guidelines

## Design Approach

**Selected Approach**: Hybrid - Custom Avatar Design + Modern Chat Interface Patterns

**Justification**: While xelochat is primarily a utility-focused conversational AI tool, the animated dotted avatar requirement creates a unique visual focal point that differentiates it from standard chat interfaces. We'll combine clean, functional chat patterns (inspired by ChatGPT, Claude) with custom avatar animation for a memorable, engaging experience.

**Core Design Principles**:
- Avatar-centric: The dotted human figure is the primary visual element and conversation partner
- State clarity: Clear visual feedback for listening, processing, and speaking states
- Minimal distraction: Clean interface that keeps focus on the conversation
- Conversational flow: Natural chat progression with clear turn-taking

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**:
- Background: 222 25% 12% (deep charcoal)
- Surface: 222 20% 18% (elevated panels)
- Primary: 220 90% 56% (vibrant blue for active states)
- Avatar Dots: 220 80% 65% (lighter blue for the dotted figure)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 70%
- Success/Active: 142 70% 50% (green for listening state)
- Error: 0 70% 60% (red for errors)

**Light Mode**:
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 220 90% 50%
- Avatar Dots: 220 70% 55%
- Text Primary: 222 25% 12%
- Text Secondary: 222 15% 40%

### B. Typography

**Font Families**:
- Primary: 'Inter' from Google Fonts - clean, modern sans-serif for all UI text
- Monospace: 'JetBrains Mono' for technical elements if needed

**Text Hierarchy**:
- App Title (xelochat): text-2xl font-bold
- User Messages: text-base font-normal
- AI Responses: text-base font-normal
- State Labels: text-sm font-medium uppercase tracking-wide
- Timestamps: text-xs font-normal opacity-60

### C. Layout System

**Spacing Units**: Use Tailwind spacing of 2, 4, 8, 12, 16, 20, 24 for consistent rhythm
- Tight spacing: p-2, gap-2 (between closely related elements)
- Standard spacing: p-4, gap-4, m-4 (default component padding)
- Comfortable spacing: p-8, gap-8 (section spacing)
- Generous spacing: p-12, p-16, p-20 (major layout sections)

**Grid System**: Single-column conversational layout with centered avatar area

---

## Component Library

### 1. Animated Avatar (Dotted Human Figure)

**Structure**: 
- Canvas or SVG-based dotted human silhouette (head, torso, arms)
- Dots arranged to form recognizable human shape
- Positioned prominently at top/center of interface

**Animation States**:
- **Idle**: Subtle breathing animation (dots gently pulse)
- **Listening**: Green glow effect around avatar, slight scale increase, dots shimmer
- **Processing**: Blue pulsing animation, rotating dots or wave effect
- **Speaking**: Lip-sync animation on mouth area - dots expand/contract rhythmically with audio amplitude, intensity matches speech volume

**Visual Treatment**:
- Dot size: 4-8px diameter
- Dot spacing: 8-12px between dots
- Glow effect: box-shadow with blur-lg, color matches state
- Smooth transitions: 300ms ease-in-out between states

### 2. Conversation Area

**Layout**:
- Max-width container (max-w-3xl) centered
- Chat bubbles alternating left (user) and right (AI)
- Clear visual distinction between user and AI messages

**User Message Bubbles**:
- Background: Primary color with 10% opacity
- Border-left: 2px solid primary color
- Padding: p-4
- Border-radius: rounded-2xl rounded-tl-sm (speech bubble effect)
- Text color: Text primary

**AI Response Bubbles**:
- Background: Surface color
- Border-left: 2px solid avatar dots color
- Padding: p-4
- Border-radius: rounded-2xl rounded-tr-sm
- Text color: Text primary

**Conversation Container**:
- Scrollable area with overflow-y-auto
- Padding: p-8
- Gap between messages: gap-4
- Auto-scroll to latest message
- Fade-in animation for new messages

### 3. Voice Input Controls

**Microphone Button**:
- Large circular button (w-16 h-16 on desktop, w-14 h-14 on mobile)
- Primary color background when inactive
- Success color (green) when actively listening
- Pulsing animation during listening
- Icon: Microphone from Heroicons
- Position: Fixed at bottom center of screen
- Elevation: shadow-2xl

**State Indicator**:
- Text label below microphone button
- States: "Tap to speak" | "Listening..." | "Processing..." | "Speaking..."
- Color changes based on state
- Smooth fade transitions

### 4. Header

**Elements**:
- App logo/name "xelochat" (left-aligned)
- Subtle gradient background on header
- Controls: Settings icon, theme toggle (right-aligned)
- Height: h-16
- Border-bottom: 1px solid with 10% opacity
- Padding: px-8

### 5. Settings/Controls Panel

**Features**:
- Voice selection dropdown (different AI voices)
- Conversation clear button
- API key management (if user-provided)
- Dark/light mode toggle
- Sliding panel or modal overlay
- Backdrop blur effect when open

---

## Interaction Patterns

### Conversation Flow:
1. User taps microphone → Avatar enters listening state (green glow)
2. User speaks → Voice waveform visualization around avatar
3. Speech ends → Avatar enters processing state (blue pulse)
4. AI response received → Avatar enters speaking state (lip-sync)
5. Response complete → Avatar returns to idle, cycle repeats

### Visual Feedback:
- Microphone button scales slightly on press (scale-95 active state)
- Avatar smoothly transitions between states (transition-all duration-300)
- Chat bubbles fade in from slight transparency (animate-fadeIn)
- Scroll position follows conversation smoothly

---

## Responsive Behavior

**Desktop (lg and up)**:
- Avatar: Large, centered at top (w-64 h-80)
- Conversation area: max-w-3xl, two-column layout possible
- Microphone: Bottom center with ample spacing

**Tablet (md)**:
- Avatar: Medium size (w-48 h-64)
- Conversation area: max-w-2xl
- Single column chat layout

**Mobile (base)**:
- Avatar: Compact (w-40 h-52) but still prominent
- Conversation area: Full width with p-4
- Microphone button: Slightly smaller, bottom fixed
- Header: Compressed with icon-only controls

---

## Images

No hero images needed. This is a utility-focused conversational interface where the animated dotted avatar serves as the primary visual element. The avatar itself is created programmatically using SVG dots or Canvas, not a static image.

**Visual Assets**:
- Avatar: SVG/Canvas-rendered dotted human figure (programmatically generated)
- Icons: Heroicons for microphone, settings, theme toggle
- No decorative imagery - focus remains on the conversation and avatar