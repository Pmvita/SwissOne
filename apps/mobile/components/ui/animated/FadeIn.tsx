import { View, ViewProps } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

interface FadeInProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "none" | "up";
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function FadeInComponent({
  children,
  delay = 0,
  duration = 400,
  direction = "none",
  ...props
}: FadeInProps) {
  const entering = direction === "up"
    ? FadeInDown.delay(delay).duration(duration).springify()
    : FadeIn.delay(delay).duration(duration);

  return (
    <AnimatedView entering={entering} {...props}>
      {children}
    </AnimatedView>
  );
}

