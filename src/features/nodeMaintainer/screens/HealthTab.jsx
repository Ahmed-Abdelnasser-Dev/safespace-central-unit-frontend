/**
 * Health Tab Screen
 *
 * Displays live node health metric cards and 24h historical charts
 * fetched from nodeAPI.getHealthHistory.
 *
 * @component
 */

import { useSelector } from 'react-redux';
import { selectSelectedNode } from '../nodesSlice';
import { useState, useEffect } from 'react';
import { nodeAPI } from '@/services/api';
import TimeSeriesChart from '@/components/ui/TimeSeriesChart.jsx';
import MetricCard from '../components/cards/MetricCard';
import SectionHeader from '../components/layout/SectionHeader';
import {
  faMicrochip,
  faMemory,
  faWifi,
  faDatabase,
  faTemperatureHalf,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';

const METRICS = [
  { key: 'cpu', label: 'CPU', icon: faMicrochip, color: '#3b7cff', unit: '%' },
  { key: 'memory', label: 'Memory', icon: faMemory, color: '#f97316', unit: '%' },
  { key: 'network', label: 'Network', icon: faWifi, color: '#22c55e', unit: '%' },
  { key: 'storage', label: 'Storage', icon: faDatabase, color: '#a78bfa', unit: '%' },
  { key: 'temperature', label: 'Temp', icon: faTemperatureHalf, color: '#f43f5e', unit: '°C' },
  { key: 'fps', label: 'FPS', icon: faVideo, color: '#06b6d4', unit: ' fps' },
];

function HealthTab() {
  const node = useSelector(selectSelectedNode);
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!node) return;
    let cancelled = false;
    setIsLoading(true);
    setHistoryData(null);
    nodeAPI.getHealthHistory(node.id, '24h')
      .then((data) => {
        if (!cancelled) {
          setHistoryData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [node?.id]);

  if (!node) return <div className="p-4 text-sm text-safe-text-muted">Select a node</div>;

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* Live metric cards — 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        {METRICS.map(({ key, label, icon, color }) => (
          <MetricCard
            key={key}
            label={label}
            value={key === 'temperature' ? node.health?.temperature : key === 'fps' ? node.health?.currentFps : node.health?.[key]}
            unit={key === 'temperature' ? '°C' : key === 'fps' ? ' fps' : '%'}
            icon={icon}
            color={color}
          />
        ))}
      </div>

      {/* Historical charts */}
      <SectionHeader title="Historical Data (24h)" showDivider />

      <div className="grid grid-cols-2 gap-4">
        {METRICS.map(({ key, label, color, unit }) => (
          <div key={key} className="bg-safe-gray border border-safe-gray-light rounded-lg p-3">
            <p className="text-xs font-semibold text-safe-text-muted mb-2">{label}</p>
            <TimeSeriesChart
              labels={historyData?.[key]?.labels || []}
              values={historyData?.[key]?.values || []}
              color={color}
              unit={unit}
              label={label}
              height={120}
              isLoading={isLoading}
              isEmpty={!isLoading && !historyData}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HealthTab;
