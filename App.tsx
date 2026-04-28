import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';

import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { ConnectionProvider } from './src/context/ConnectionContext';
import { ControllerSwitcher } from './src/components/ControllerSwitcher';
import { InputLog } from './src/components/InputLog';
import { useInputLog } from './src/hooks/useInputLog';
import { ControllerType } from './src/types';

import { JoyConController } from './src/controllers/JoyConController';
import { N64Controller } from './src/controllers/N64Controller';
import { NESController } from './src/controllers/NESController';
import { PlayStationController } from './src/controllers/PlayStationController';
import { SegaGenesisController } from './src/controllers/SegaGenesisController';
import { SegaSaturnController } from './src/controllers/SegaSaturnController';

// ─── Inner app (needs SettingsContext) ───────────────────────────────────────

function AppInner() {
  const [activeController, setActiveController] = useState<ControllerType>('PLAYSTATION');
  const { events, logEvent, clearLog } = useInputLog();
  const { showInputLog, transparency } = useSettings();

  // Lock to landscape on mount
  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    ).catch(() => {});
  }, []);

  const renderController = () => {
    const props = { onInput: logEvent };
    switch (activeController) {
      case 'NES':           return <NESController {...props} />;
      case 'SEGA_GENESIS':  return <SegaGenesisController {...props} />;
      case 'SEGA_SATURN':   return <SegaSaturnController {...props} />;
      case 'N64':           return <N64Controller {...props} />;
      case 'JOYCON':        return <JoyConController {...props} />;
      case 'PLAYSTATION':   return <PlayStationController {...props} />;
    }
  };

  // transparency 0 → opacity 1.0, transparency 80 → opacity 0.2
  const controllerOpacity = 1 - transparency / 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar — controller tabs + settings gear */}
      <ControllerSwitcher current={activeController} onChange={setActiveController} />

      {/* Controller area with transparency applied */}
      <View style={[styles.controllerArea, { opacity: controllerOpacity }]}>
        {renderController()}
      </View>

      {/* Input log overlay — only shown when enabled in settings */}
      {showInputLog && (
        <InputLog events={events} onClear={clearLog} />
      )}
    </SafeAreaView>
  );
}

// ─── Root (provides context) ─────────────────────────────────────────────────

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Show status bar — gives natural top gap and avoids full-screen look */}
      <StatusBar style="light" backgroundColor="#111118" translucent={false} />
      <SettingsProvider>
        <ConnectionProvider>
          <AppInner />
        </ConnectionProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111118',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#111118',
    // Push content below status bar + breathing room on all sides
    paddingTop: (RNStatusBar.currentHeight ?? 24) + 4,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  controllerArea: {
    flex: 1,
  },
});
