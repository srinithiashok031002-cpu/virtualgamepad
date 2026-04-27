import { useCallback, useRef, useState } from 'react';
import { InputEvent } from '../types';

const MAX_LOG_ENTRIES = 30;

export function useInputLog() {
  const [events, setEvents] = useState<InputEvent[]>([]);
  const counterRef = useRef(0);

  const logEvent = useCallback((event: Omit<InputEvent, 'id' | 'timestamp'>) => {
    const newEvent: InputEvent = {
      ...event,
      id: `evt-${++counterRef.current}`,
      timestamp: Date.now(),
    };
    setEvents(prev => [newEvent, ...prev].slice(0, MAX_LOG_ENTRIES));
  }, []);

  const clearLog = useCallback(() => setEvents([]), []);

  return { events, logEvent, clearLog };
}
