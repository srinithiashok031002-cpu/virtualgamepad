import React, { useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { triggerButtonPress, triggerButtonRelease } from '../utils/haptics';

interface ShoulderButtonProps {
  label: string;
  color?: string;
  textColor?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  onPress: (name: string) => void;
  onRelease: (name: string) => void;
}

export const ShoulderButton: React.FC<ShoulderButtonProps> = ({
  label,
  color = '#333',
  textColor = '#fff',
  width = 64,
  height = 28,
  borderRadius = 8,
  onPress,
  onRelease,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const gesture = Gesture.Manual()
    .onTouchesDown(() => {
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
      triggerButtonPress();
      onPress(label);
    })
    .onTouchesUp(() => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 5 }).start();
      triggerButtonRelease();
      onRelease(label);
    })
    .onTouchesCancelled(() => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 5 }).start();
      onRelease(label);
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.btn,
          { width, height, borderRadius, backgroundColor: color, transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.text, { color: textColor }]}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  text: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
