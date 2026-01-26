import { View, ViewProps } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

interface ScaleInProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  ...props
}: ScaleInProps) {
  return (
    <AnimatedView
      entering={ZoomIn.delay(delay).duration(duration).springify()}
      {...props}
    >
      {children}
    </AnimatedView>
  );
}

