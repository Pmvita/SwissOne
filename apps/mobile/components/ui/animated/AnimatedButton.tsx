import { TouchableOpacity, TouchableOpacityProps, Text, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(disabled || loading ? 0.5 : 1, { duration: 200 });
  }, [disabled, loading]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  };

  const baseStyles = "items-center justify-center rounded-lg font-semibold";
  
  const variants = {
    primary: "bg-primary-700",
    secondary: "bg-accent-600",
    outline: "border-2 border-primary-700 bg-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };

  const textStyles = {
    primary: { color: "#ffffff" },
    secondary: { color: "#ffffff" },
    outline: { color: "#334e68" },
  };

  return (
    <AnimatedTouchable
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={[animatedStyle, variant === "outline" && { borderColor: "#334e68" }]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#334e68" : "#ffffff"} />
      ) : (
        typeof children === "string" ? (
          <Text style={[{ fontSize: 16, fontWeight: "600" }, textStyles[variant]]}>
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </AnimatedTouchable>
  );
}

