/**
 * useDispatcherData
 *
 * Thin context consumer for the Emergency Dispatcher feature.
 * All state is hosted in DispatcherProvider (Redux-backed) and shared across
 * the dispatcher route subtree. This hook is the single consumption point so
 * every panel and page reads from one source of truth.
 *
 * Usage:
 *   const { cases, units, selectCase, dispatchUnits, ... } = useDispatcherData();
 *
 * The returned shape (see DispatcherProvider.jsx) is the seam contract:
 * consumer components are not aware of whether data comes from mock fixtures,
 * a local reducer, or a Redux slice backed by the real API — they just call
 * the actions and read the data from this hook.
 */

import { useContext } from 'react';
import { DispatcherContext } from '../context/DispatcherProvider';

export function useDispatcherData() {
  const ctx = useContext(DispatcherContext);
  if (!ctx) {
    throw new Error(
      'useDispatcherData must be called inside a DispatcherProvider. ' +
      'Ensure the component is rendered within the /cases route subtree.'
    );
  }
  return ctx;
}
