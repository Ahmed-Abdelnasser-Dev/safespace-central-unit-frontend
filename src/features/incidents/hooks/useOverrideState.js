import { useState } from 'react';

/**
 * Custom hook encapsulating override panel state and handlers.
 *
 * @param {object} params
 * @param {number} params.initialSpeedLimit
 * @param {string[]} params.initialLaneConfig
 * @param {function} params.setSpeedLimit  - parent state setter
 * @param {function} params.setLaneConfiguration - parent state setter
 * @param {function} params.setDecisionType - parent state setter
 * @param {function} params.getDefaultLaneCount - returns current default lane count
 */
export function useOverrideState({
  initialSpeedLimit,
  initialLaneConfig,
  setSpeedLimit,
  setLaneConfiguration,
  setDecisionType,
  getDefaultLaneCount,
}) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [tempSpeedLimit, setTempSpeedLimit] = useState(initialSpeedLimit);
  const [tempLaneConfig, setTempLaneConfig] = useState(initialLaneConfig);
  const [allLanesState, setAllLanesState] = useState('open');
  const [laneOverrideMode, setLaneOverrideMode] = useState('per');

  const handleSaveOverride = () => {
    const count = getDefaultLaneCount();
    const finalLanes =
      laneOverrideMode === 'all'
        ? Array(count).fill(allLanesState)
        : tempLaneConfig.slice(0, count);
    setSpeedLimit(tempSpeedLimit);
    setLaneConfiguration(finalLanes);
    setDecisionType('MODIFIED');
    setOverrideOpen(false);
  };

  const handleCancelOverride = () => {
    setTempSpeedLimit(initialSpeedLimit);
    setTempLaneConfig(initialLaneConfig);
    setOverrideOpen(false);
  };

  const reset = (speed, lanes) => {
    setTempSpeedLimit(speed);
    setTempLaneConfig(lanes);
    setAllLanesState(lanes[0] || 'open');
    setLaneOverrideMode('per');
    setOverrideOpen(false);
  };

  return {
    overrideOpen,
    setOverrideOpen,
    tempSpeedLimit,
    setTempSpeedLimit,
    tempLaneConfig,
    setTempLaneConfig,
    allLanesState,
    setAllLanesState,
    laneOverrideMode,
    setLaneOverrideMode,
    handleSaveOverride,
    handleCancelOverride,
    reset,
  };
}
