import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

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

export default function App() {
  const [activeController, setActiveController] = useState<ControllerType>('PLAYSTATION');
  const { events, logEvent, clearLog } = useInputLog();

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

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>
        {/* Top bar — controller tabs */}
        <ControllerSwitcher current={activeController} onChange={setActiveController} />

        {/* Controller area */}
        <View style={styles.controllerArea}>
          {renderController()}
        </View>

        {/* Input log overlay (top-right) */}
        <InputLog events={events} onClear={clearLog} />
      </SafeAreaView>
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
  },
  controllerArea: {
    flex: 1,
  },
});
