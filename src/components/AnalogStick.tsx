import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { triggerButtonPress, triggerStickSnap } from '../utils/haptics';
import { AnalogStickProps, StickPosition } from '../types';

const DEAD_ZONE = 0.08;

export const AnalogStick: React.FC<AnalogStickProps> = ({
  label,
  size = 100,
  onMove,
}) => {
  const KNOB_SIZE = size * 0.42;
  const MAX_TRAVEL = (size - KNOB_SIZE) / 2;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const knobScale = useRef(new Animated.Value(1)).current;

  const lastPos = useRef<StickPosition>({ x: 0, y: 0 });
  const isActive = useRef(false);

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const springReturn = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
        mass: 0.5,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
        mass: 0.5,
      }),
      Animated.spring(knobScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 3,
      }),
    ]).start();
    triggerStickSnap();
    lastPos.current = { x: 0, y: 0 };
    onMove(label, { x: 0, y: 0 });
  }, [translateX, translateY, knobScale, onMove, label]);

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      isActive.current = true;
      triggerButtonPress();
      Animated.spring(knobScale, {
        toValue: 0.9,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    })
    .onUpdate(e => {
      const rawX = clamp(e.translationX, -MAX_TRAVEL, MAX_TRAVEL);
      const rawY = clamp(e.translationY, -MAX_TRAVEL, MAX_TRAVEL);

      // Circular clamping
      const dist = Math.sqrt(rawX * rawX + rawY * rawY);
      const clampedDist = Math.min(dist, MAX_TRAVEL);
      const angle = Math.atan2(rawY, rawX);
      const cx = dist > 0 ? clampedDist * Math.cos(angle) : 0;
      const cy = dist > 0 ? clampedDist * Math.sin(angle) : 0;

      translateX.setValue(cx);
      translateY.setValue(cy);

      const nx = cx / MAX_TRAVEL;
      const ny = cy / MAX_TRAVEL;

      const pos: StickPosition = {
        x: Math.abs(nx) < DEAD_ZONE ? 0 : parseFloat(nx.toFixed(2)),
        y: Math.abs(ny) < DEAD_ZONE ? 0 : parseFloat(ny.toFixed(2)),
      };

      if (pos.x !== lastPos.current.x || pos.y !== lastPos.current.y) {
        lastPos.current = pos;
        onMove(label, pos);
      }
    })
    .onEnd(() => {
      isActive.current = false;
      springReturn();
    })
    .onFinalize(() => {
      if (isActive.current) {
        isActive.current = false;
        springReturn();
      }
    });

  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
      <GestureDetector gesture={gesture}>
        <View style={[styles.trackArea, { width: size, height: size }]}>
          <Animated.View
            style={[
              styles.knob,
              {
                width: KNOB_SIZE,
                height: KNOB_SIZE,
                borderRadius: KNOB_SIZE / 2,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: knobScale },
                ],
              },
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#1a1a2a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  trackArea: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    backgroundColor: '#3a3a5a',
    borderWidth: 2,
    borderColor: '#555',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});
