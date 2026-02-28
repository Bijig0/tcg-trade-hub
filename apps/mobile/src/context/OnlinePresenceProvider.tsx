import React, { createContext, useContext, type PropsWithChildren } from 'react';
import useOnlinePresence from '@/hooks/useOnlinePresence/useOnlinePresence';

type PresenceContextValue = {
  onlineUserIds: Set<string>;
  isOnline: (userId: string) => boolean;
};

const PresenceContext = createContext<PresenceContextValue | null>(null);

export const OnlinePresenceProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const presence = useOnlinePresence();
  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = (): PresenceContextValue => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within OnlinePresenceProvider');
  }
  return context;
};
