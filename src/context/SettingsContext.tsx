import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated } from 'react-native';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ButtonOffset {
  x: Animated.Value;
  y: Animated.Value;
  baseX: number;
  baseY: number;
}

interface SettingsContextType {
  // Toggles
  showInputLog: boolean;
  customizeMode: boolean;
  // Sliders (0–100 %)
  transparency: number;   // 0 = fully visible, 100 = invisible
  sensitivity: number;    // 50 = 0.5×, 100 = 1.0×, 200 = 2.0×
  // Actions
  toggleInputLog: () => void;
  toggleCustomizeMode: () => void;
  setTransparency: (v: number) => void;
  setSensitivity: (v: number) => void;
  // Drag offsets (keyed by groupId)
  getOffset: (groupId: string) => ButtonOffset;
  resetOffsets: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showInputLog, setShowInputLog] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [transparency, setTransparencyState] = useState(0);
  const [sensitivity, setSensitivityState] = useState(100); // 100 = 1.0×

  // Offset map — stable Animated.Values per groupId
  const offsetMap = useRef<Record<string, ButtonOffset>>({});

  const getOffset = useCallback((groupId: string): ButtonOffset => {
    if (!offsetMap.current[groupId]) {
      offsetMap.current[groupId] = {
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        baseX: 0,
        baseY: 0,
      };
    }
    return offsetMap.current[groupId];
  }, []);

  const resetOffsets = useCallback(() => {
    Object.values(offsetMap.current).forEach(o => {
      o.x.setValue(0);
      o.y.setValue(0);
      o.baseX = 0;
      o.baseY = 0;
    });
  }, []);

  const toggleInputLog = useCallback(() => setShowInputLog(v => !v), []);
  const toggleCustomizeMode = useCallback(() => setCustomizeMode(v => !v), []);
  const setTransparency = useCallback((v: number) => setTransparencyState(Math.round(v)), []);
  const setSensitivity = useCallback((v: number) => setSensitivityState(Math.round(v)), []);

  return (
    <SettingsContext.Provider
      value={{
        showInputLog,
        customizeMode,
        transparency,
        sensitivity,
        toggleInputLog,
        toggleCustomizeMode,
        setTransparency,
        setSensitivity,
        getOffset,
        resetOffsets,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
