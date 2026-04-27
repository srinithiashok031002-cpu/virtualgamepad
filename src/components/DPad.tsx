import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { triggerButtonPress, triggerButtonRelease } from '../utils/haptics';
import { DPadProps } from '../types';

const ARM_SIZE = 36;
const ARM_LONG = 44;
const CENTER = 36;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function detectDirection(x: number, y: number, size: number): Direction | null {
  const centerX = size / 2;
  const centerY = size / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const threshold = size * 0.18;
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'RIGHT' : 'LEFT';
  return dy > 0 ? 'DOWN' : 'UP';
}

export const DPad: React.FC<DPadProps> = ({ onPress, onRelease, size = 124 }) => {
  const activeDir = useRef<Direction | null>(null);
  const scales = useRef<Record<Direction, Animated.Value>>({
    UP: new Animated.Value(1),
    DOWN: new Animated.Value(1),
    LEFT: new Animated.Value(1),
    RIGHT: new Animated.Value(1),
  }).current;

  function pressDir(dir: Direction) {
    if (activeDir.current === dir) return;
    if (activeDir.current) releaseDir(activeDir.current);
    activeDir.current = dir;
    Animated.spring(scales[dir], { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    triggerButtonPress();
    onPress(dir);
  }

  function releaseDir(dir: Direction) {
    Animated.spring(scales[dir], { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
    triggerButtonRelease();
    onRelease(dir);
  }

  const gesture = Gesture.Manual()
    .onTouchesDown(e => {
      const t = e.changedTouches[0];
      const dir = detectDirection(t.x, t.y, size);
      if (dir) pressDir(dir);
    })
    .onTouchesMove(e => {
      const t = e.changedTouches[0];
      const dir = detectDirection(t.x, t.y, size);
      if (dir && dir !== activeDir.current) pressDir(dir);
      else if (!dir && activeDir.current) {
        releaseDir(activeDir.current);
        activeDir.current = null;
      }
    })
    .onTouchesUp(() => {
      if (activeDir.current) {
        releaseDir(activeDir.current);
        activeDir.current = null;
      }
    })
    .onTouchesCancelled(() => {
      if (activeDir.current) {
        releaseDir(activeDir.current);
        activeDir.current = null;
      }
    });

  const arm = ARM_LONG;
  const thick = ARM_SIZE;

  const arrow = (dir: string) => {
    const map: Record<string, string> = { UP: '▲', DOWN: '▼', LEFT: '◀', RIGHT: '▶' };
    return map[dir] ?? '';
  };

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { width: size, height: size }]}>
        {/* UP */}
        <Animated.View
          style={[
            styles.arm,
            styles.up,
            { width: thick, height: arm, transform: [{ scale: scales.UP }] },
          ]}
        >
          <Text style={styles.arrow}>{arrow('UP')}</Text>
        </Animated.View>

        {/* DOWN */}
        <Animated.View
          style={[
            styles.arm,
            styles.down,
            { width: thick, height: arm, transform: [{ scale: scales.DOWN }] },
          ]}
        >
          <Text style={styles.arrow}>{arrow('DOWN')}</Text>
        </Animated.View>

        {/* LEFT */}
        <Animated.View
          style={[
            styles.arm,
            styles.left,
            { width: arm, height: thick, transform: [{ scale: scales.LEFT }] },
          ]}
        >
          <Text style={styles.arrow}>{arrow('LEFT')}</Text>
        </Animated.View>

        {/* RIGHT */}
        <Animated.View
          style={[
            styles.arm,
            styles.right,
            { width: arm, height: thick, transform: [{ scale: scales.RIGHT }] },
          ]}
        >
          <Text style={styles.arrow}>{arrow('RIGHT')}</Text>
        </Animated.View>

        {/* Center nub */}
        <View style={[styles.center, { width: thick, height: thick }]} />
      </View>
    </GestureDetector>
  );
};

const DPAD_COLOR = '#2a2a3a';
const DPAD_BORDER = '#111';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  arm: {
    position: 'absolute',
    backgroundColor: DPAD_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: DPAD_BORDER,
    elevation: 4,
  },
  up: {
    top: 0,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -ARM_SIZE / 2,
    borderRadius: 4,
  },
  down: {
    bottom: 0,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -ARM_SIZE / 2,
    borderRadius: 4,
  },
  left: {
    left: 0,
    top: '50%',
    marginTop: -ARM_SIZE / 2,
    borderRadius: 4,
  },
  right: {
    right: 0,
    top: '50%',
    marginTop: -ARM_SIZE / 2,
    borderRadius: 4,
  },
  center: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -ARM_SIZE / 2,
    marginTop: -ARM_SIZE / 2,
    backgroundColor: DPAD_COLOR,
    borderWidth: 1.5,
    borderColor: DPAD_BORDER,
  },
  arrow: {
    color: '#666',
    fontSize: 11,
  },
});
