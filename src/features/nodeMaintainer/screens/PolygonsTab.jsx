/**
 * Polygons Tab Screen
 * 
 * Displays and manages lane polygons synced with configured lanes
 * Each lane automatically has a polygon (can be empty or defined)
 * 
 * @component
 */

import { useSelector } from 'react-redux';
import { selectSelectedNode } from '../nodesSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListItem from '../components/lists/ListItem';
import EmptyState from '../components/lists/EmptyState';
import { typography, fontFamily } from '../styles/typography';

function PolygonsTab({ onEditPolygon }) {
  const node = useSelector(selectSelectedNode);

  if (!node) return <div className="p-[20px]">Select a node</div>;

  const lanes = node?.roadRules?.lanes || [];
  
  // Map lanes to their polygons (or create placeholder if missing)
  const lanePolygonPairs = lanes.map(lane => {
    const polygon = node.lanePolygons?.find(p => p.laneNumber === lane.id);
    return {
      lane,
      polygon: polygon || null,
      isEmpty: !polygon || polygon.isEmpty || !polygon.points || polygon.points.length === 0,
    };
  });

  const definedCount = lanePolygonPairs.filter(p => !p.isEmpty).length;

  return (
    <div className="p-[20px] space-y-[20px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#101828]" style={{ ...typography.heading2, fontFamily }}>
            Lane Polygons
          </h3>
          <p className="text-[#6a7282] text-sm mt-1" style={{ fontFamily }}>
            {definedCount} of {lanes.length} polygons defined
            {lanes.length === 0 && ' • Add lanes in Road Configuration first'}
          </p>
        </div>
      </div>

      {lanes.length === 0 ? (
        <EmptyState
          icon="road"
          title="No lanes configured"
          message="Go to Road Configuration tab and add lanes first. Each lane will automatically get a polygon."
        />
      ) : (
        <div className="space-y-[8px]">
          {lanePolygonPairs.map(({ lane, polygon, isEmpty }) => (
            <ListItem
              key={lane.id}
              title={lane.name}
              subtitle={
                isEmpty 
                  ? <span className="text-[#f59e0b] font-medium">⚠ Polygon not defined</span>
                  : <span className="text-[#22c55e]">✓ {polygon.points?.length || 0} points</span>
              }
              actions={[
                {
                  label: isEmpty ? 'Define Polygon' : 'Edit Polygon',
                  icon: <FontAwesomeIcon icon={isEmpty ? 'plus' : 'pen'} style={{ width: '12px', height: '12px' }} />,
                  onClick: () => onEditPolygon(polygon || {
                    id: `poly-${Date.now()}-${lane.id}`,
                    name: lane.name,
                    laneNumber: lane.id,
                    type: 'lane',
                    points: [],
                    isEmpty: true,
                  }),
                  variant: isEmpty ? 'primary' : 'default'
                }
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PolygonsTab;
