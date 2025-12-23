# Animated Components (Mobile)

Custom animated components using React Native Reanimated for the SwissOne mobile application.

## Components

### AnimatedButton

Touch-responsive button with press animations.

```tsx
import { AnimatedButton } from "@/components/ui/animated";

<AnimatedButton variant="primary" size="lg" onPress={handlePress}>
  Press Me
</AnimatedButton>
```

### AnimatedCard

Card component with fade-in-down animation.

```tsx
import { AnimatedCard } from "@/components/ui/animated";

<AnimatedCard delay={200} hover>
  <Text>Card content</Text>
</AnimatedCard>
```

### FadeIn, SlideIn, ScaleIn

Animation wrapper components for fade, slide, and scale animations.

See [docs/ANIMATIONS.md](../../../../docs/ANIMATIONS.md) for full documentation.

