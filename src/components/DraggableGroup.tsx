/**
 * DraggableGroup
 * Wraps any controller section so it can be drag-repositioned in customize mode.
 * - Normal mode  : renders children normally, transform = stored offset
 * - Customize mode: glowing border + pan gesture to move the group
 */
import React, { useCallback } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSettings } from '../context/SettingsContext';

interface DraggableGroupProps {
  groupId: string;
  label?: string;
  children: React.ReactNode;
  style?: object;
}

export const DraggableGroup: React.FC<DraggableGroupProps> = ({
  groupId,
  label,
  children,
  style,
}) => {
  const { customizeMode, getOffset } = useSettings();
  const offset = getOffset(groupId);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate(e => {
      offset.x.setValue(offset.baseX + e.translationX);
      offset.y.setValue(offset.baseY + e.translationY);
    })
    .onEnd(e => {
      offset.baseX += e.translationX;
      offset.baseY += e.translationY;
    });

  if (!customizeMode) {
    // Normal mode: apply stored offset as transform only
    return (
      <Animated.View
        style={[
          style,
          { transform: [{ translateX: offset.x }, { translateY: offset.y }] },
        ]}
      >
        {children}
      </Animated.View>
    );
  }

  // Customize mode: draggable with glowing border
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          style,
          styles.customizeBorder,
          { transform: [{ translateX: offset.x }, { translateY: offset.y }] },
        ]}
      >
        {label && (
          <View style={styles.labelBadge}>
            <Text style={styles.labelText}>{label}</Text>
          </View>
        )}
        <View style={styles.childWrap} pointerEvents="none">
          {children}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  customizeBorder: {
    borderWidth: 1.5,
    borderColor: '#7c4dff',
    borderRadius: 10,
    borderStyle: 'dashed',
    padding: 4,
  },
  labelBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#7c4dff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 10,
  },
  labelText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  childWrap: {
    // Disable child touches in customize mode so gestures reach the parent
  },
});
