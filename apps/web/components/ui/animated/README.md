# Animated Components (Web)

Custom animated components using Framer Motion for the SwissOne web application.

## Components

### AnimatedButton

Interactive button with hover and press animations.

```tsx
import { AnimatedButton } from "@/components/ui/animated";

<AnimatedButton variant="primary" size="lg" onClick={handleClick}>
  Click Me
</AnimatedButton>
```

### AnimatedLinkButton

Animated button wrapped in a Next.js Link component.

```tsx
import { AnimatedLinkButton } from "@/components/ui/animated";

<AnimatedLinkButton href="/dashboard" variant="primary" size="lg">
  Go to Dashboard
</AnimatedLinkButton>
```

### AnimatedCard

Card component with fade-in and hover lift effects.

```tsx
import { AnimatedCard } from "@/components/ui/animated";

<AnimatedCard delay={0.2} hover>
  <div>Card content</div>
</AnimatedCard>
```

### FadeIn, SlideIn, ScaleIn

Animation wrapper components for fade, slide, and scale animations.

See [docs/ANIMATIONS.md](../../../../docs/ANIMATIONS.md) for full documentation.

