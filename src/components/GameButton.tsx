import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { triggerButtonPress, triggerButtonRelease } from '../utils/haptics';
import { GameButtonProps } from '../types';

export const GameButton: React.FC<GameButtonProps> = ({
  label,
  color,
  textColor = '#ffffff',
  shape = 'circle',
  size = 52,
  width,
  height,
  onPress,
  onRelease,
  fontSize = 13,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scale]);

  const animateOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  }, [scale]);

  const gesture = Gesture.Manual()
    .onTouchesDown(() => {
      animateIn();
      triggerButtonPress();
      onPress(label);
    })
    .onTouchesUp(() => {
      animateOut();
      triggerButtonRelease();
      onRelease(label);
    })
    .onTouchesCancelled(() => {
      animateOut();
      onRelease(label);
    });

  const btnWidth = width ?? size;
  const btnHeight = height ?? size;

  const borderRadius =
    shape === 'circle'
      ? size / 2
      : shape === 'rounded'
      ? 10
      : 6;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.button,
          {
            width: btnWidth,
            height: btnHeight,
            borderRadius,
            backgroundColor: color,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.35)',
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
