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

  if (!node) return <div className="p-4 text-safe-text-gray">Select a node</div>;

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
    <div className="p-6 space-y-6 animate-slideUp">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-safe-text-dark text-lg">Lane Polygons</h3>
          <p className="text-safe-text-gray text-sm mt-1">{definedCount} of {lanes.length} polygons defined{lanes.length === 0 && ' • Add lanes in Road Configuration first'}</p>
        </div>
      </div>

      {lanes.length === 0 ? (
        <EmptyState icon="road" title="No lanes configured" message="Go to Road Configuration tab and add lanes first. Each lane will automatically get a polygon." />
      ) : (
        <div className="space-y-3">
          {lanePolygonPairs.map(({ lane, polygon, isEmpty }) => (
            <ListItem
              key={lane.id}
              title={lane.name}
              subtitle={isEmpty ? <span className="text-safe-warning font-medium">⚠ Polygon not defined</span> : <span className="text-safe-success">✓ {polygon.points?.length || 0} points</span>}
              actions={[
                {
                  label: isEmpty ? 'Define Polygon' : 'Edit Polygon',
                  icon: <FontAwesomeIcon icon={isEmpty ? 'plus' : 'pen'} style={{ width: '12px', height: '12px' }} />,
                  onClick: () => onEditPolygon(polygon || { id: `poly-${Date.now()}-${lane.id}`, name: lane.name, laneNumber: lane.id, type: 'lane', points: [], isEmpty: true }),
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
