import { createContext, useCallback, useContext, useState } from 'react';

/**
 * Two separate contexts to prevent pages from re-rendering when the actions
 * slot changes — only AppTopBar (consumer of ActionsContext) re-renders.
 */
const ActionsContext = createContext(null);
const SetActionsContext = createContext(() => {});

export function PageConfigProvider({ children }) {
  const [actions, setActionsState] = useState(null);
  const setActions = useCallback((node) => setActionsState(node), []);

  return (
    <SetActionsContext.Provider value={setActions}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </SetActionsContext.Provider>
  );
}

/** Read current top-bar actions. Used by AppTopBar. */
export function useTopBarActions() {
  return useContext(ActionsContext);
}

/** Write top-bar actions. Used by PageActions component. */
export function useSetTopBarActions() {
  return useContext(SetActionsContext);
}
