/**
 * Reusable Historical Charts Grid Component
 * 
 * Displays CPU and Temperature history charts stacked vertically
 * Charts update every minute with new data points
 * 
 * @component
 * @param {Array} cpuData - CPU history data array (5 values)
 * @param {Array} temperatureData - Temperature history data array (5 values)
 */

import LineChart from '../charts/LineChart';

function HistoricalChartsGrid({ cpuData, temperatureData }) {
  const timeLabels = ['-4m', '-3m', '-2m', '-1m', 'now'];

  return (
    <div className="flex flex-col gap-[16px] lg:gap-[20px]">
      <LineChart
        data={cpuData}
        color="#3b82f6"
        title="CPU History"
        timeLabels={timeLabels}
      />
      
      <LineChart
        data={temperatureData}
        color="#f97316"
        title="Temperature History"
        timeLabels={timeLabels}
      />
    </div>
  );
}

export default HistoricalChartsGrid;
