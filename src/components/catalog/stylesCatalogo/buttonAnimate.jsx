import { useRef } from "react";
import { Animated, Pressable, Text } from "react-native";

function AnimatedButton({ onPress, title, style, textStyle}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => onPress && onPress());
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
      >
        <Text style={textStyle}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}
export default AnimatedButton;