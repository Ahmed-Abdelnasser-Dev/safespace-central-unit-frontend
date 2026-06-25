import { useEffect } from 'react';
import { useSetTopBarActions } from '@/contexts/PageConfigContext';

/**
 * PageActions — teleports page-specific action buttons into the AppTopBar.
 *
 * Usage inside any page component:
 *
 *   <PageActions>
 *     <Button icon="rotate" onClick={handleRefresh}>Refresh</Button>
 *     <Button variant="primary" icon="plus" onClick={handleAdd}>Add Node</Button>
 *   </PageActions>
 *
 * Runs after every render (no dependency array) so action button state
 * (loading, disabled) stays in sync with the page's local state.
 * Returns null — renders nothing into the page DOM.
 */
function PageActions({ children }) {
  const setActions = useSetTopBarActions();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setActions(children);
    return () => setActions(null);
  });

  return null;
}

export default PageActions;
