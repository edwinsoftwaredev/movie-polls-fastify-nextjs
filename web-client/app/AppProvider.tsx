'use client';

import { createContext, PropsWithChildren } from 'react';

interface AppContextType {
  documentBodySize: number;
}

export const AppContext = createContext<AppContextType>({
  documentBodySize: 0,
});

interface AppProviderProps extends PropsWithChildren {}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AppContext.Provider
      value={{
        documentBodySize: 0,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
