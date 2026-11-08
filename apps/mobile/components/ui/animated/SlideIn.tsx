import { View, ViewProps } from "react-native";
import Animated, {
  SlideInRight,
  SlideInLeft,
  SlideInUp,
  SlideInDown,
} from "react-native-reanimated";

interface SlideInProps extends ViewProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  duration = 400,
  ...props
}: SlideInProps) {
  const enteringAnimations = {
    up: SlideInUp.delay(delay).duration(duration).springify(),
    down: SlideInDown.delay(delay).duration(duration).springify(),
    left: SlideInLeft.delay(delay).duration(duration).springify(),
    right: SlideInRight.delay(delay).duration(duration).springify(),
  };

  return (
    <AnimatedView entering={enteringAnimations[direction]} {...props}>
      {children}
    </AnimatedView>
  );
}

