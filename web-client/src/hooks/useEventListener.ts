import { useEffect, useRef } from 'react';

const useEventListener = (
  eventName: keyof WindowEventMap,
  handler: (...args: [any]) => void,
  element?: Element | Window
) => {
  const isWindow = typeof window !== 'undefined';

  // Create a ref that stores handler
  const savedHandler = useRef<Parameters<typeof useEventListener>[1]>(handler);

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported =
        (element && element.addEventListener) || (isWindow && window);
      if (!isSupported) return;
      // Create event listener that calls handler function stored in ref
      const eventListener = (event: WindowEventMap[typeof eventName]) =>
        savedHandler.current(event);
      // Add event listener
      (element || window).addEventListener(eventName, eventListener);
      // Remove event listener on cleanup
      return () => {
        (element || window).removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element, isWindow] // Re-run if eventName or element changes
  );
};

export default useEventListener;
