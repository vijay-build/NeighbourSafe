---
name: Solar Flare Sentinel
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#e0c0b1'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#a78b7d'
  outline-variant: '#584237'
  surface-tint: '#ffb690'
  primary: '#ffb690'
  on-primary: '#552100'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#9d4300'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00b07a'
  on-tertiary-container: '#003b26'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  telemetry-num:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

This design system establishes a focused, high-alert telemetry aesthetic tailored for neighborhood defense, localized surveillance, and perimeter monitoring. Rather than defaulting to passive enterprise blues or clinical security conventions, it channels the vigilance of aerospace night operations and orbital telemetry. The visual tone balances mission-critical tactical clarity with human-centered community protection.

The design movement combines **tactical aerospace HUD styling** with **high-contrast dark-mode minimalism**. Deep obsidian voids reduce visual fatigue during prolonged nocturnal monitoring, while piercing solar flares and luminous ember accents immediately direct the operator's eye to perimeter shifts, motion alerts, and status anomalies. Interfaces feel engineered, calibrated, and ultra-responsive—instilling authoritative vigilance, zero latency, and unwavering protection.

## Colors

The color palette is built upon high-contrast night-vision dynamics, separating structural containment from active situational data.

### Foundation Tiers (The Obsidian Void)
- **Void Base (`#080a0f`)**: Deepest background tone, grounding the viewport in absolute low-light immersion.
- **Surface Elevation 1 (`#0f131a`)**: Panel backgrounds, base container surfaces, and navigation sidebars.
- **Surface Elevation 2 (`#181d26`)**: Elevated cards, telemetry feeds, and interactive module frames.
- **Border / Structural Grid (`#242b38`)**: Low-energy framing lines defining bounding boxes without optic clutter.

### Tactical Accents
- **Primary / Solar Ember (`#f97316`)**: Active radar vectors, primary calls to action, selected states, and real-time triggers. Radiates thermal energy.
- **Secondary / Luminous Gold (`#f59e0b`)**: Warning thresholds, cautionary perimeters, telemetry timestamps, and telemetry highlight badges.
- **Tertiary / Verified Emerald (`#10b981`)**: Secure node confirmation, cleared sectors, encrypted connection statuses, and all-clear health indicators.
- **Critical Alert / Electric Crimson (`#ef4444`)**: Unsanctioned perimeter breaches, sensor disconnects, and emergency SOS triggers.
- **Neutral / Titanium Gray (`#94a3b8`)**: Secondary metrics, structural labels, inactive nodes, and body text.

## Typography

The typographic system fuses the bold, geometric contours of **Space Grotesk** with the surgical precision of **JetBrains Mono**.

- **Space Grotesk** serves as the narrative and navigational backbone, delivering punchy structural headers and human-legible situational context.
- **JetBrains Mono** commands all numeric values, coordinate grids, camera timestamps, sensor telemetry readouts, and status codes. Its fixed-width metric prevents layout jitter during real-time data streaming and reinforces the tactical command station atmosphere.
- Numerical values and labels utilize uppercase casing and wide tracking to optimize scanning speed in high-stress, low-light environments.

## Layout & Spacing

Layouts adhere to an orchestrated 12-column telemetry fluid grid on desktop viewports and a consolidated 4-column stack on mobile devices.

- **Desktop (1024px+)**: 12 columns with 24px (`1.5rem`) gutters and 32px (`2rem`) screen margins. Sidebars house fixed operational controls (sensor lists, perimeter maps), while the central canvas displays dynamic situational feeds.
- **Tablet (768px - 1023px)**: 8 columns with 16px (`1rem`) gutters and 24px (`1.5rem`) margins. Secondary status sidebars collapse into toggleable slide-over telemetry trays.
- **Mobile (< 768px)**: 4 columns with 16px (`1rem`) gutters and 16px (`1rem`) margins. Strict linear flow; alerts anchor to the top and persistent action triggers fixate at the bottom for thumb reachability.

The vertical rhythm utilizes a base-4 grid system. Internal component paddings rely on `space-sm` (8px) and `space-md` (16px), keeping interfaces dense, compact, and information-rich without sacrificing visual clarity.

## Elevation & Depth

Visual depth avoids conventional diffuse drop shadows, opting instead for **surface layering**, **subtle luminescence**, and **precision tactical outlines**.

- **Floor Layer (Base)**: `#080a0f`. Unlit background void representing inactive monitoring space.
- **Tier 1 (Panels & Nav)**: `#0f131a` accompanied by a 1px crisp outline of `rgba(148, 163, 184, 0.12)`.
- **Tier 2 (Action Units & Cards)**: `#181d26` with a 1px border of `rgba(148, 163, 184, 0.18)`.
- **Active / Alert Elevation**: When a sector triggers an alert or an element gains focus, ambient diffusion activates using targeted colored rim glows:
  - Active Tactical Element: `0 0 16px rgba(249, 115, 22, 0.25), inset 0 0 0 1px rgba(249, 115, 22, 0.6)`
  - Emergency / Breach State: `0 0 24px rgba(239, 68, 68, 0.4), inset 0 0 0 1px rgba(239, 68, 68, 0.8)`
  - Secure Status: `0 0 12px rgba(16, 185, 129, 0.2), inset 0 0 0 1px rgba(16, 185, 129, 0.4)`

## Shapes

The design system maintains a **Soft-Technical (Level 1)** geometric silhouette. 

- Default elements (buttons, inputs, telemetry tags, badges) feature a `0.25rem` (4px) radius.
- Cards, modal viewports, and primary perimeter tiles feature a `0.5rem` (8px) radius.
- Sensor status nodes and pulsing telemetry radar pings remain pure circles (`9999px`).

This controlled, low-curvature approach avoids the consumer softness of pill shapes while preventing the aggressive brutality of sharp 90-degree corners, delivering a professional, mil-spec hardware feel.

## Components

### Buttons
- **Primary Tactical**: Solar Ember background (`#f97316`), dark slate text (`#080a0f`), font `JetBrains Mono` bold uppercase with 0.05em tracking. Hover induces a luminous outer glow: `box-shadow: 0 0 16px rgba(249, 115, 22, 0.4)`. Active press depresses scale to `0.98`.
- **Secondary (Sub-system)**: Transparent background, 1px border of `#94a3b8` at 30% opacity, titanium gray text (`#94a3b8`). On hover, border shifts to `#f97316` and text brightens to `#f8fafc`.
- **Danger / Breach**: Crimson fill (`#ef4444`) with high-contrast white text (`#ffffff`), reinforced with subtle pulse animation during mission-critical confirm states.

### Chips & Telemetry Badges
- Built using `label-sm` (`JetBrains Mono`).
- Background: 10% opacity tint of respective status color (Ember, Gold, Emerald, or Crimson).
- Border: 1px solid at 30% opacity.
- Prefix: Includes a 6px status beacon circle that pulses slowly when tracking live streams.

### Inputs & Sensor Selectors
- Background: Surface 2 (`#181d26`).
- Border: 1px solid `rgba(148, 163, 184, 0.2)`.
- Text: `#f8fafc` in `Space Grotesk`. Placeholders use `#94a3b8` at 50% opacity.
- Focus: 1px border in Solar Ember (`#f97316`) accompanied by an outer aura `0 0 8px rgba(249, 115, 22, 0.3)`. No generic browser outlines.

### Cards & Telemetry Tiles
- Encapsulated in Surface 1 (`#0f131a`) with a 1px border of `#242b38`.
- Header bars within cards contain monospaced sector tags (e.g., `ZONE // 04 - NORTH GATE`) aligned left, with real-time status pings pinned right.
- High-priority cards adopt a 2px top accent line colored according to threat classification (Emerald for secure, Amber for warning, Crimson for intrusion).

### Lists & Activity Feeds
- Structured as dense alternating records bordered at the bottom with 1px `rgba(148, 163, 184, 0.08)`.
- Timestamp column set in `JetBrains Mono` muted titanium, aligned to fixed character widths.
- Event descriptions set in `Space Grotesk` with inline color-coded entity tags.

### Checkboxes & Radios
- Box size: 16px × 16px, 2px corner radius.
- Unchecked: Background `#080a0f`, border 1.5px solid `rgba(148, 163, 184, 0.4)`.
- Checked: Solar Ember (`#f97316`) background, displaying a dark obsidian glyph checkmark.

### Domain-Specific Components
- **Perimeter Radar HUD**: Concentric circular rings rendered in low-opacity Titanium (`#94a3b8` at 15%) over `#080a0f`, with a directional sweep line emitting an Amber gradient trail.
- **Incident Escalation Strip**: Full-width emergency banner with high-visibility diagonal caution stripes (`#ef4444` and `#991b1b`) containing rapid dispatch triggers.