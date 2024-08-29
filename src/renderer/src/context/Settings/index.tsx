import React, {
  type ReactNode,
  useState,
} from "react";
import { createCustomContext } from "@renderer/utils/createContext";

type ISettingsContext = {
  tabsLock: boolean;
  setTabsLock: React.Dispatch<React.SetStateAction<boolean>>
}

export const [SettingsContext, useSettings] = createCustomContext<ISettingsContext>("Settings Context");

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tabsLock, setTabsLock] = useState<boolean>(true);

  const value = {
    tabsLock,
    setTabsLock
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
