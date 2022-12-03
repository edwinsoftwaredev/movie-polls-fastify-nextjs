'use client';

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useEventListener } from 'src/hooks';

interface AppContextType {
  documentBodySize: number;
}

export const AppContext = createContext<AppContextType>({
  documentBodySize: 0,
});

const handleDocumentBodyResize = (
  element: HTMLElement,
  setSize: Dispatch<SetStateAction<number>>
) => {
  setSize(element?.clientWidth ?? 0);
};

interface AppProviderProps extends PropsWithChildren {}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const isWindow = typeof window !== 'undefined';
  const [bodyWidth, setBodyWidth] = useState(
    isWindow ? window.document.body.clientWidth : 0
  );

  const documentBodyHandlerClbk = useCallback(() => {
    isWindow && handleDocumentBodyResize(window.document.body, setBodyWidth);
  }, [isWindow]);

  useEventListener('resize', documentBodyHandlerClbk);

  useEffect(() => {
    isWindow && handleDocumentBodyResize(window.document.body, setBodyWidth);
  }, [isWindow]);

  return (
    <AppContext.Provider
      value={{
        documentBodySize: bodyWidth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
