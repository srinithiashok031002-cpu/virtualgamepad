/**
 * A simple horizontal slider using PanGestureHandler.
 * Value range: [min, max], reported as integer steps.
 */
import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SimpleSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  accentColor?: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}

const TRACK_WIDTH = 220;

export const SimpleSlider: React.FC<SimpleSliderProps> = ({
  label,
  value,
  min,
  max,
  unit = '',
  accentColor = '#7c4dff',
  onChange,
  formatValue,
}) => {
  const range = max - min;
  const pct = (value - min) / range; // 0–1
  const fillWidth = useRef(new Animated.Value(pct * TRACK_WIDTH)).current;
  const lastValue = useRef(value);

  const updateFill = useCallback((newVal: number) => {
    const p = (newVal - min) / range;
    fillWidth.setValue(p * TRACK_WIDTH);
  }, [fillWidth, min, range]);

  const gesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(e => {
      // Tap position on track → immediate jump
      const rawPct = Math.max(0, Math.min(1, e.x / TRACK_WIDTH));
      const newVal = Math.round(min + rawPct * range);
      lastValue.current = newVal;
      updateFill(newVal);
      onChange(newVal);
    })
    .onUpdate(e => {
      const rawPct = Math.max(0, Math.min(1, e.x / TRACK_WIDTH));
      const newVal = Math.round(min + rawPct * range);
      if (newVal !== lastValue.current) {
        lastValue.current = newVal;
        updateFill(newVal);
        onChange(newVal);
      }
    });

  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <GestureDetector gesture={gesture}>
        <View style={[styles.track, { width: TRACK_WIDTH }]}>
          <Animated.View
            style={[styles.fill, { width: fillWidth, backgroundColor: accentColor }]}
          />
          <View style={[styles.thumb, { left: pct * TRACK_WIDTH - 8, borderColor: accentColor }]} />
        </View>
      </GestureDetector>
      <Text style={[styles.value, { color: accentColor }]}>{displayValue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    width: 100,
    fontWeight: '600',
  },
  track: {
    height: 6,
    backgroundColor: '#2a2a3e',
    borderRadius: 3,
    justifyContent: 'center',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    top: -5,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    width: 52,
    textAlign: 'right',
  },
});
