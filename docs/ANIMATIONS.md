# Animation Components Guide

SwissOne uses custom animated components for smooth, professional animations that enhance the user experience while maintaining the Swiss banking aesthetic.

## Web Components (Framer Motion)

### AnimatedButton

A button component with hover and press animations.

```tsx
import { AnimatedButton } from "@/components/ui/animated";

<AnimatedButton variant="primary" size="lg">
  Click Me
</AnimatedButton>
```

**Props:**
- `variant`: "primary" | "secondary" | "outline"
- `size`: "sm" | "md" | "lg"
- `disabled`: boolean
- Standard button props

### AnimatedCard

A card component with fade-in and hover lift effects.

```tsx
import { AnimatedCard } from "@/components/ui/animated";

<AnimatedCard delay={0.2} hover>
  <div>Card content</div>
</AnimatedCard>
```

**Props:**
- `delay`: number (animation delay in seconds)
- `hover`: boolean (enable hover effect)

### FadeIn

Wrapper component for fade-in animations.

```tsx
import { FadeIn } from "@/components/ui/animated";

<FadeIn delay={0.1} duration={0.4}>
  <div>Content that fades in</div>
</FadeIn>
```

### SlideIn

Wrapper component for slide-in animations from any direction.

```tsx
import { SlideIn } from "@/components/ui/animated";

<SlideIn direction="up" delay={0.2} distance={30}>
  <div>Content that slides in</div>
</SlideIn>
```

**Props:**
- `direction`: "up" | "down" | "left" | "right"
- `delay`: number
- `distance`: number (pixels to slide)

### ScaleIn

Wrapper component for scale-in animations.

```tsx
import { ScaleIn } from "@/components/ui/animated";

<ScaleIn delay={0.1} scale={0.9}>
  <div>Content that scales in</div>
</ScaleIn>
```

## Mobile Components (React Native Reanimated)

### AnimatedButton

Touch-responsive button with press animations.

```tsx
import { AnimatedButton } from "@/components/ui/animated";

<AnimatedButton variant="primary" size="lg" onPress={handlePress}>
  Press Me
</AnimatedButton>
```

**Props:**
- `variant`: "primary" | "secondary" | "outline"
- `size`: "sm" | "md" | "lg"
- `loading`: boolean (shows loading spinner)
- `disabled`: boolean
- Standard TouchableOpacity props

### AnimatedCard

Card component with fade-in-down animation.

```tsx
import { AnimatedCard } from "@/components/ui/animated";

<AnimatedCard delay={200} hover>
  <Text>Card content</Text>
</AnimatedCard>
```

**Props:**
- `delay`: number (delay in milliseconds)
- `hover`: boolean (enables press animation)

### FadeIn

Wrapper component for fade-in animations.

```tsx
import { FadeIn } from "@/components/ui/animated";

<FadeIn delay={100} duration={400} direction="up">
  <Text>Content that fades in</Text>
</FadeIn>
```

**Props:**
- `delay`: number (milliseconds)
- `duration`: number (milliseconds)
- `direction`: "none" | "up"

### SlideIn

Wrapper component for slide-in animations.

```tsx
import { SlideIn } from "@/components/ui/animated";

<SlideIn direction="up" delay={200} duration={400}>
  <Text>Content that slides in</Text>
</SlideIn>
```

**Props:**
- `direction`: "up" | "down" | "left" | "right"
- `delay`: number (milliseconds)
- `duration`: number (milliseconds)

### ScaleIn

Wrapper component for scale-in animations.

```tsx
import { ScaleIn } from "@/components/ui/animated";

<ScaleIn delay={100} duration={300}>
  <Text>Content that scales in</Text>
</ScaleIn>
```

## Design Principles

1. **Subtle & Professional**: Animations should enhance UX without being distracting
2. **Fast**: Animations should complete quickly (200-400ms typically)
3. **Meaningful**: Use animations to provide feedback and guide attention
4. **Consistent**: Use the same animation patterns throughout the app
5. **Accessible**: Respect `prefers-reduced-motion` (to be implemented)

## Usage Tips

- Use `FadeIn` for general content that appears on mount
- Use `SlideIn` for elements that should draw attention
- Use `AnimatedCard` for dashboard cards and content blocks
- Use `AnimatedButton` for all interactive buttons
- Stagger animations using `delay` props for sequential reveals

## Performance

- Animations use native performance optimizations
- Web: Framer Motion uses hardware acceleration
- Mobile: React Native Reanimated runs on UI thread for 60fps

