import { View, ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { useEffect } from "react";

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function AnimatedCard({
  children,
  className = "",
  hover = false,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 }, () => {
      // Animation complete
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (hover) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (hover) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  return (
    <AnimatedView
      entering={FadeInDown.delay(delay).duration(300).springify()}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      style={animatedStyle}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedView>
  );
}

