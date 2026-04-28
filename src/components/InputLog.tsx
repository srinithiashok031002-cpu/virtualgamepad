/**
 * InputLog overlay
 * - Uses pointerEvents="box-none" on outer so touches pass through to the controller
 * - The list itself has pointerEvents="none" (display only)
 * - Only the CLEAR button is interactive
 */
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { InputEvent, StickPosition } from '../types';

interface InputLogProps {
  events: InputEvent[];
  onClear: () => void;
}

function formatState(state: InputEvent['state']): string {
  if (typeof state === 'string') return state.toUpperCase();
  const pos = state as StickPosition;
  return `x:${pos.x.toFixed(2)} y:${pos.y.toFixed(2)}`;
}

function stateColor(state: InputEvent['state']): string {
  if (state === 'pressed') return '#4ade80';
  if (state === 'released') return '#f87171';
  return '#60a5fa';
}

const LogRow = React.memo(({ item }: { item: InputEvent }) => (
  <View style={styles.row}>
    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
    <Text style={[styles.state, { color: stateColor(item.state) }]}>
      {formatState(item.state)}
    </Text>
  </View>
));

export const InputLog: React.FC<InputLogProps> = ({ events, onClear }) => {
  return (
    // box-none: outer container passes touches through; children are still interactive
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.header}>
        <Text style={styles.title}>INPUT LOG</Text>
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>CLEAR</Text>
        </TouchableOpacity>
      </View>
      {/* List is display-only — touches pass through to controller below */}
      <View pointerEvents="none">
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LogRow item={item} />}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 38,
    right: 0,
    width: 190,
    maxHeight: 220,
    backgroundColor: 'rgba(10,10,20,0.82)',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
    borderBottomLeftRadius: 10,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    color: '#555',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearText: {
    color: '#444',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  list: {
    maxHeight: 180,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a2e',
  },
  name: {
    color: '#aaa',
    fontSize: 10,
    flex: 1,
    fontWeight: '600',
  },
  state: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 6,
  },
});
