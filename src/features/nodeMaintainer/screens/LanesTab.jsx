import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSelectedNode,
  updateLaneStatus,
  addLane,
  removeLane,
  updateNode,
} from '../nodesSlice';
import Button from '@/components/ui/Button.jsx';
import Select from '@/components/ui/Select.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddLaneModal from '../components/AddLaneModal.jsx';
import DeleteLaneModal from '../components/DeleteLaneModal.jsx';

// AddLaneModal's laneStatusOptions expects: { value, label, icon (FA object), color (hex), bg (hex) }
import {
  faCircleCheck,
  faCircleXmark,
  faArrowRight,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

const LANE_STATUSES = [
  { value: 'open', label: 'Open', icon: faCircleCheck, color: '#22c55e', bg: '#e8f5e9' },
  { value: 'blocked', label: 'Blocked', icon: faCircleXmark, color: '#d63e4d', bg: '#fee2e2' },
  { value: 'right', label: 'Right only', icon: faArrowRight, color: '#247cff', bg: '#e3f2fd' },
  { value: 'left', label: 'Left only', icon: faArrowLeft, color: '#247cff', bg: '#e3f2fd' },
];

const STATUS_STYLES = {
  open: 'text-safe-success bg-safe-success/10 border-safe-success/20',
  blocked: 'text-safe-danger bg-safe-danger/10 border-safe-danger/20',
  right: 'text-safe-blue bg-safe-blue/10 border-safe-blue/20',
  left: 'text-safe-blue bg-safe-blue/10 border-safe-blue/20',
};

export default function LanesTab({ onEditPolygon }) {
  const dispatch = useDispatch();
  const node = useSelector(selectSelectedNode);
  const [speedLimit, setSpeedLimit] = useState(node?.roadRules?.speedLimit || 80);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isAddLaneOpen, setIsAddLaneOpen] = useState(false);
  const [laneToDelete, setLaneToDelete] = useState(null);

  if (!node) return <div className="p-5 text-sm text-safe-text-muted">Select a node</div>;

  const lanes = node.roadRules?.lanes || [];

  const getNextLaneId = () =>
    lanes.length > 0 ? Math.max(...lanes.map((l) => l.id)) + 1 : 1;

  const handleStatusChange = (laneId, status) => {
    dispatch(updateLaneStatus({ nodeId: node.id, laneId, status }));
  };

  const handleAddLane = ({ name, type, status }) => {
    const id = getNextLaneId();
    dispatch(addLane({
      nodeId: node.id,
      lane: { id, name: name || `Lane ${id}`, type: type || 'standard', status },
    }));
    setIsAddLaneOpen(false);
  };

  const handleDeleteLane = () => {
    if (!laneToDelete) return;
    dispatch(removeLane({ nodeId: node.id, laneId: laneToDelete.id }));
    setLaneToDelete(null);
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveError('');
    dispatch(updateNode({
      nodeId: node.id,
      updates: {
        roadRules: {
          ...node.roadRules,
          speedLimit,
          lanes: node.roadRules?.lanes || [],
        },
      },
    }))
      .unwrap()
      .then(() => setIsSaving(false))
      .catch((err) => {
        setIsSaving(false);
        setSaveError(err || 'Failed to save road configuration');
      });
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full">
      {/* Speed Limit */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold text-safe-text-primary">Speed Limit</p>
          <span className="text-sm font-bold text-safe-blue">{speedLimit} km/h</span>
        </div>
        <input
          type="range"
          min={30}
          max={180}
          step={5}
          value={speedLimit}
          onChange={(e) => setSpeedLimit(Number(e.target.value))}
          className="w-full h-2 bg-safe-gray-light rounded-lg appearance-none cursor-pointer accent-safe-blue-btn"
        />
        <div className="flex justify-between text-[10px] text-safe-text-muted mt-1">
          <span>30 km/h</span><span>180 km/h</span>
        </div>
      </div>

      {/* Lanes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-safe-text-primary">
            Lanes
            <span className="ml-1.5 text-[10px] font-normal text-safe-text-muted">({lanes.length})</span>
          </p>
          <Button variant="outline" size="sm" icon="plus" onClick={() => setIsAddLaneOpen(true)}>
            Add Lane
          </Button>
        </div>

        {lanes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-safe-text-muted gap-2">
            <FontAwesomeIcon icon="road" className="text-2xl opacity-40" />
            <p className="text-xs">No lanes configured. Add a lane to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lanes.map((lane) => {
              const polygon = node.lanePolygons?.find((p) => p.laneNumber === lane.id);
              const hasPolygon = polygon && polygon.points && polygon.points.length > 0;
              const statusStyle = STATUS_STYLES[lane.status] || STATUS_STYLES.open;

              return (
                <div
                  key={lane.id}
                  className="bg-safe-gray border border-safe-gray-light rounded-lg px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-safe-text-primary truncate">{lane.name}</p>
                    <p className="text-[10px] text-safe-text-muted mt-0.5 capitalize">{lane.type}</p>
                  </div>

                  {/* Status chip */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${statusStyle}`}>
                    {LANE_STATUSES.find(s => s.value === lane.status)?.label || lane.status}
                  </span>

                  <Select
                    value={lane.status}
                    onChange={(e) => handleStatusChange(lane.id, e.target.value)}
                    className="!w-28 !text-xs"
                  >
                    {LANE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>

                  {/* Polygon state button */}
                  <button
                    onClick={() =>
                      onEditPolygon(
                        polygon || {
                          id: `poly-${Date.now()}-${lane.id}`,
                          name: lane.name,
                          laneNumber: lane.id,
                          type: 'lane',
                          points: [],
                          isEmpty: true,
                        }
                      )
                    }
                    title={hasPolygon ? 'Edit polygon' : 'Draw polygon'}
                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors flex-shrink-0 ${
                      hasPolygon
                        ? 'text-safe-success border-safe-success/30 bg-safe-success/5 hover:bg-safe-success/10'
                        : 'text-safe-orange border-safe-orange/30 bg-safe-orange/5 hover:bg-safe-orange/10'
                    }`}
                  >
                    <FontAwesomeIcon icon={hasPolygon ? 'pen' : 'plus'} />
                    <span>{hasPolygon ? `${polygon.points.length}pt` : 'Draw'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setLaneToDelete(lane)}
                    title="Delete lane"
                    className="w-7 h-7 flex items-center justify-center text-safe-text-muted hover:text-safe-danger transition-colors rounded flex-shrink-0"
                  >
                    <FontAwesomeIcon icon="trash" className="text-xs" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {saveError && (
        <div className="rounded-lg bg-safe-danger/10 border border-safe-danger/20 px-4 py-3 text-safe-danger text-sm">
          {saveError}
        </div>
      )}

      <Button
        variant="primary"
        size="sm"
        icon="floppy-disk"
        onClick={handleSave}
        isLoading={isSaving}
        className="w-full justify-center"
      >
        Save Road Configuration
      </Button>

      <AddLaneModal
        isOpen={isAddLaneOpen}
        onClose={() => setIsAddLaneOpen(false)}
        onConfirm={handleAddLane}
        laneStatusOptions={LANE_STATUSES}
        defaultName={`Lane ${getNextLaneId()}`}
        defaultType="standard"
      />

      <DeleteLaneModal
        lane={laneToDelete}
        onClose={() => setLaneToDelete(null)}
        onConfirm={handleDeleteLane}
      />
    </div>
  );
}
