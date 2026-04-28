export type ControllerType =
  | 'NES'
  | 'SEGA_GENESIS'
  | 'SEGA_SATURN'
  | 'N64'
  | 'JOYCON'
  | 'PLAYSTATION';

export type InputEventType = 'button' | 'dpad' | 'stick';

export type ButtonState = 'pressed' | 'released';

export interface StickPosition {
  x: number; // -1.0 to 1.0
  y: number; // -1.0 to 1.0
}

export interface InputEvent {
  id: string;
  controller: ControllerType;
  type: InputEventType;
  name: string;
  state: ButtonState | StickPosition;
  timestamp: number;
}

export interface GameButtonProps {
  label: string;
  color: string;
  textColor?: string;
  shape?: 'circle' | 'rounded' | 'rect';
  size?: number;
  width?: number;
  height?: number;
  onPress: (name: string) => void;
  onRelease: (name: string) => void;
  fontSize?: number;
}

export interface DPadProps {
  onPress: (direction: string) => void;
  onRelease: (direction: string) => void;
  size?: number;
}

export interface AnalogStickProps {
  label: string;
  size?: number;
  sensitivity?: number;
  onMove: (name: string, pos: StickPosition) => void;
}

export interface ControllerProps {
  onInput: (event: Omit<InputEvent, 'id' | 'timestamp'>) => void;
}

export const CONTROLLER_LABELS: Record<ControllerType, string> = {
  NES: 'NES',
  SEGA_GENESIS: 'Sega Genesis',
  SEGA_SATURN: 'Sega Saturn',
  N64: 'N64',
  JOYCON: 'Joy-Con',
  PLAYSTATION: 'PlayStation',
};
