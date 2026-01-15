import { useEffect, useRef } from 'react';

interface ClickOutsideHandler {
    (event: MouseEvent | TouchEvent): void;
}


function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: ClickOutsideHandler): void {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            // Do nothing if clicking ref's element or descendant elements
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener as EventListener);
        document.addEventListener('touchstart', listener as EventListener);

        return () => {
            document.removeEventListener('mousedown', listener as EventListener);
            document.removeEventListener('touchstart', listener as EventListener);
        };
    }, [ref, handler]); // Re-run if ref or handler changes
}
export default useOnClickOutside;