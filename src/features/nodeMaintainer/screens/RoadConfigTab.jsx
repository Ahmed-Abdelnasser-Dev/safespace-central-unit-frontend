/**
 * Road Configuration Tab Screen
 *
 * Configure lanes, lane status, and road speed limits
 *
 * @component
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedNode,
  updateLaneStatus,
  addLane,
  removeLane,
  updateNode,
} from "../nodesSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faArrowRight,
  faArrowLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import SectionHeader from "../components/layout/SectionHeader";
import PrimaryButton from "../components/forms/PrimaryButton";
import ListItem from "../components/lists/ListItem";
import RoadStatusDisplay from "../components/sections/RoadStatusDisplay";
import SpeedLimitConfig from "./SpeedLimitConfig";
import AddLaneModal from "../components/AddLaneModal";
import DeleteLaneModal from "../components/DeleteLaneModal";
import { fontFamily } from "../styles/typography";
import Button from "@/components/ui/Button.jsx";

const LANE_STATUS_OPTIONS = [
  { value: "open", label: "Open", icon: faCircleCheck, color: "#22c55e", bg: "#e8f5e9" },
  { value: "blocked", label: "Blocked", icon: faCircleXmark, color: "#d63e4d", bg: "#fee2e2" },
  { value: "right", label: "Right", icon: faArrowRight, color: "#247cff", bg: "#e3f2fd" },
  { value: "left", label: "Left", icon: faArrowLeft, color: "#247cff", bg: "#e3f2fd" },
];

function RoadConfigTab() {
  const dispatch = useDispatch();
  const node = useSelector(selectSelectedNode);
  const [speedLimit, setSpeedLimit] = useState(node?.roadRules?.speedLimit || 120);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddLaneOpen, setIsAddLaneOpen] = useState(false);
  const [laneToDelete, setLaneToDelete] = useState(null);

  if (!node)
    return <div className="p-[16px] text-[#6a7282]">Select a node</div>;

  const lanes = node?.roadRules?.lanes || [];

  const getNextLaneId = () =>
    lanes.length > 0 ? Math.max(...lanes.map((l) => l.id)) + 1 : 1;

  const handleLaneStatusChange = (laneId, newStatus) => {
    dispatch(updateLaneStatus({ nodeId: node.id, laneId, status: newStatus }));
    setHasChanges(true);
  };

  const handleConfirmAddLane = ({ name, type, status }) => {
    const nextId = getNextLaneId();
    dispatch(addLane({
      nodeId: node.id,
      lane: { id: nextId, name: name || `Lane ${nextId}`, type: type || "Custom Lane", status },
    }));
    setHasChanges(true);
    setIsAddLaneOpen(false);
  };

  const handleConfirmDeleteLane = () => {
    if (!laneToDelete) return;
    dispatch(removeLane({ nodeId: node.id, laneId: laneToDelete.id }));
    setHasChanges(true);
    setLaneToDelete(null);
  };

  const handleSpeedLimitChange = (value) => {
    setSpeedLimit(value);
    setHasChanges(true);
  };

  const handleSaveConfig = () => {
    dispatch(updateNode({
      nodeId: node.id,
      updates: { roadRules: { ...node.roadRules, speedLimit } },
    }));
    setHasChanges(false);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto animate-slideUp">
      {/* Node Display Output */}
      <div className="space-y-[8px] sm:space-y-[10px] md:space-y-[12px]">
        <h4 className="font-semibold text-safe-text-dark text-lg">Node Display Output</h4>
        <RoadStatusDisplay
          roadName={node.location?.address || node.name}
          speedLimit={speedLimit}
          lanes={lanes}
          laneStatusOptions={LANE_STATUS_OPTIONS}
        />
      </div>

      <SectionHeader title="Lane Configuration" showDivider={true} />

      {/* Lane Configuration */}
      <div className="space-y-4 mt-3">
        <div className="flex justify-between items-center">
          <span />
          <Button variant="ghost" onClick={() => setIsAddLaneOpen(true)} className="!text-safe-accent hover:!bg-safe-accent/10">
            + Add Lane
          </Button>
        </div>

        <div className="space-y-3">
          {lanes.length > 0 ? (
            lanes.map((lane) => (
              <ListItem
                key={lane.id}
                title={lane.name}
                subtitle={lane.type}
                actions={[
                  ...LANE_STATUS_OPTIONS.map((status) => ({
                    label: status.label,
                    icon: <FontAwesomeIcon icon={status.icon} style={{ width: "12px", height: "12px" }} />,
                    onClick: () => handleLaneStatusChange(lane.id, status.value),
                    variant: lane.status === status.value ? "primary" : "default",
                  })),
                  {
                    label: "Remove",
                    icon: <FontAwesomeIcon icon={faTrash} style={{ width: "12px", height: "12px" }} />,
                    onClick: () => setLaneToDelete(lane),
                    variant: "danger",
                  },
                ]}
              />
            ))
          ) : (
            <div className="p-4 bg-white border border-safe-border rounded-xl text-center">
              <p className="text-safe-text-gray">No lanes configured</p>
            </div>
          )}
        </div>
      </div>

      <SpeedLimitConfig speedLimit={speedLimit} onChange={handleSpeedLimitChange} />

      <div className="pt-2">
        <PrimaryButton onClick={handleSaveConfig} disabled={!hasChanges} icon="floppy-disk" text="Save Road Configuration" />
      </div>

      <AddLaneModal
        isOpen={isAddLaneOpen}
        onClose={() => setIsAddLaneOpen(false)}
        onConfirm={handleConfirmAddLane}
        laneStatusOptions={LANE_STATUS_OPTIONS}
        defaultName={`Lane ${getNextLaneId()}`}
        defaultType="Custom Lane"
      />

      <DeleteLaneModal
        lane={laneToDelete}
        onClose={() => setLaneToDelete(null)}
        onConfirm={handleConfirmDeleteLane}
      />
    </div>
  );
}

export default RoadConfigTab;
