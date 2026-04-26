/**
 * Health Tab Screen
 * 
 * Displays node health metrics and historical charts
 * 
 * @component
 */

import { useSelector } from 'react-redux';
import { selectSelectedNode } from '../nodesSlice';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faMemory, faWifi, faDatabase } from '@fortawesome/free-solid-svg-icons';
import MetricCard from '../components/cards/MetricCard';
import SectionHeader from '../components/layout/SectionHeader';
import HistoricalChartsGrid from '../components/grids/HistoricalChartsGrid';
import { fontFamily } from '../styles/typography';

function HealthTab() {
  const node = useSelector(selectSelectedNode);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [temperatureHistory, setTemperatureHistory] = useState([]);

  // Initialize and update historical data every minute
  useEffect(() => {
    if (!node) return;

    // Initialize with current values
    const initCpuHistory = Array(5).fill(node.health.cpu || 0);
    const initTempHistory = Array(5).fill(node.health.temperature || 0);
    setCpuHistory(initCpuHistory);
    setTemperatureHistory(initTempHistory);

    // Update every minute (60000ms)
    const interval = setInterval(() => {
      setCpuHistory(prev => {
        const newHistory = [...prev.slice(1), node.health.cpu || 0];
        return newHistory;
      });
      setTemperatureHistory(prev => {
        const newHistory = [...prev.slice(1), node.health.temperature || 0];
        return newHistory;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [node]);

  if (!node) return <div className="p-[16px] text-[#6a7282]" style={{ fontFamily: 'Arimo, sans-serif' }}>Select a node</div>;

  return (
    <div className="p-[20px] space-y-[20px]">
      {/* Health Metrics Cards with Progress Bars */}
      <div className="grid grid-cols-2 gap-[14px]">
        <MetricCard
          label="CPU"
          value={node.health.cpu}
          unit="%"
          icon={faMicrochip}
          color="#3b82f6"
        />
        <MetricCard
          label="Memory"
          value={node.health.memory}
          unit="%"
          icon={faMemory}
          color="#f97316"
        />
        <MetricCard
          label="Network"
          value={node.health.network}
          unit="%"
          icon={faWifi}
          color="#22c55e"
        />
        <MetricCard
          label="Storage"
          value={node.health.storage}
          unit="%"
          icon={faDatabase}
          color="#a78bfa"
        />
      </div>

      {/* History Section - Line Charts */}
      <SectionHeader title="Historical Data" showDivider={true} />

      <HistoricalChartsGrid
        cpuData={cpuHistory.length === 5 ? cpuHistory : Array(5).fill(node.health.cpu || 0)}
        temperatureData={temperatureHistory.length === 5 ? temperatureHistory : Array(5).fill(node.health.temperature || 0)}
      />

      
    </div>
  );
}

export default HealthTab;
