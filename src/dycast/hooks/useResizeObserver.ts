// src/dycast/hooks/useResizeObserver.ts
import { useEffect, useRef, RefObject } from 'react';

export const useResizeObserver = <T extends Element>(
  callback: (entries: ResizeObserverEntry[]) => void,
  deps: any[] = []
): RefObject<T> => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver(callback);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, ...deps]);

  return elementRef;
};