---
name: FerIA Communal System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#58413c'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8c716a'
  outline-variant: '#e0bfb8'
  surface-tint: '#aa3618'
  primary: '#a63416'
  on-primary: '#ffffff'
  primary-container: '#c84c2c'
  on-primary-container: '#fffcff'
  inverse-primary: '#ffb4a2'
  secondary: '#3f6653'
  on-secondary: '#ffffff'
  secondary-container: '#beead1'
  on-secondary-container: '#436b58'
  tertiary: '#8b4c11'
  on-tertiary: '#ffffff'
  tertiary-container: '#a96429'
  on-tertiary-container: '#fffcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd2'
  primary-fixed-dim: '#ffb4a2'
  on-primary-fixed: '#3c0800'
  on-primary-fixed-variant: '#881f01'
  secondary-fixed: '#c1ecd4'
  secondary-fixed-dim: '#a5d0b9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#274e3d'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  price-display:
    fontFamily: Lexend
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style
The design system is built for a vibrant, community-driven social marketplace. The brand personality is **Modern-Artisanal**: it marries the tactile, earthy spirit of local Palpalá trade with a contemporary, high-performance mobile interface.

The visual style is **Modern / High-Contrast**, prioritizing absolute clarity for outdoor use under heavy sunlight. It avoids cold corporate aesthetics in favor of a warm, communal atmosphere that feels accessible to all age groups and levels of tech-literacy. The emotional response should be one of trust, neighborly connection, and local pride.

## Colors
The palette is rooted in the landscape of Jujuy, optimized for high-contrast accessibility (WCAG AA).

- **Primary (Terracotta):** Used for primary calls to action, active states, and brand-defining moments.
- **Secondary (Forest Green):** Used for headers, merchant verification status, and elements requiring a sense of stability.
- **Accent (Golden Sun):** Used strictly for highlights like "Sale" badges or "New" indicators; not for text unless paired with a dark background.
- **Background (Warm White):** A specialized off-white that reduces glare and eye strain in bright outdoor environments.
- **WhatsApp Green:** Reserved exclusively for communication actions to leverage existing mental models for trust and instant contact.

## Typography
This design system utilizes **Lexend** across all levels. Lexend was specifically designed to reduce visual stress and improve reading proficiency, making it ideal for a diverse user base.

- **Scale:** The base font size starts at 18px to ensure legibility on mobile devices in high-glare environments.
- **Hierarchy:** High contrast in weight (Bold vs. Regular) is used instead of subtle gray scales to ensure information remains distinct.
- **Pricing:** A dedicated `price-display` style ensures that the core transactional data is always the most prominent element on a card.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first usage. 

- **Grid:** A 4-column grid for mobile and an 8-column grid for tablets. 
- **Touch Targets:** Minimum touch target size for any interactive element is 48x48px. 
- **Rhythm:** An 8px linear scale is used for all padding and margins to maintain a clean, structured appearance while allowing for "breathing room" that prevents the UI from feeling cluttered.
- **Mobile-First:** All primary navigation and filtering are positioned within the "thumb zone" (bottom 60% of the screen).

## Elevation & Depth
To maintain high contrast and "modern-artisanal" clarity, this design system avoids complex shadows which can appear "muddy" on low-quality screens or in bright light.

- **Tonal Layers:** Depth is communicated through subtle shifts in background color (e.g., a slightly darker cream for container backgrounds) and crisp 1px borders in `Forest Green` at 10% opacity.
- **Flat Surfaces:** Cards and sections use a flat aesthetic with defined borders rather than floating shadows.
- **Active State:** When pressed, elements shift color rather than increasing shadow depth, providing immediate tactile feedback.

## Shapes
The shape language uses **Rounded** corners to evoke a friendly, approachable, and communal feel. 

- **Components:** Standard buttons and input fields use a `0.5rem` radius. 
- **Large Cards:** Use `1rem` radius to feel soft and distinct from the screen edge.
- **Badges:** Use a full pill-shape (circular ends) to contrast against the rectangular nature of product photos.

## Components
- **Product Cards:** Must feature a 1:1 aspect ratio image container. The price is placed in the bottom right in a high-contrast Forest Green box or bold text. Merchant names are accompanied by a small "verified" leaf icon.
- **Buttons:** Primary buttons are solid Terracotta with White text. The "WhatsApp Contact" button is a special-case component using the official Brand Green with a leading icon for instant recognition.
- **Input Fields:** Search bars use a 2px Deep Charcoal border when focused and include a large magnifying glass icon.
- **Badges (Trueque/New):** Placed in the top-left corner of product cards. "Trueque" (Swap) uses a Forest Green background; "New/Used" uses Golden Sun.
- **Lists:** Merchant lists use large avatars (64px) and high-contrast labels to ensure easy scanning.
- **Navigation:** A bottom navigation bar with large icons and text labels, ensuring the user always knows their location within the marketplace.