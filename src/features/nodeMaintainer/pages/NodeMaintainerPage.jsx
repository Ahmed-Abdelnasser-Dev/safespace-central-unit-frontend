/**
 * Node Maintainer Dashboard - Responsive Design
 * @component
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNodes,
  registerNode,
  deleteNode,
  updateNode,
  selectAllNodes,
  selectNode,
  selectSelectedNode,
  selectCurrentTab,
  setCurrentTab,
} from '../nodesSlice';
import NodeMaintainerHeader from '../components/NodeMaintainerHeader.jsx';
import NetworkMapCard from '../components/cards/NetworkMapCard.jsx';
import NodesListCard from '../components/NodesList.jsx';
import NodeDetailPanel from '../components/NodeDetailPanel.jsx';
import OverviewTab from '../screens/OverviewTab.jsx';
import RoadConfigTab from '../screens/RoadConfigTab.jsx';
import NodeConfigTab from '../screens/NodeConfigTab.jsx';
import HealthTab from '../screens/HealthTab.jsx';
import PolygonsTab from '../screens/PolygonsTab.jsx';
import PolygonEditorDialog from '../components/PolygonEditorDialog.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EditNodeModal from '../components/EditNodeModal.jsx';
import AddNodeModal from '../components/AddNodeModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function NodeMaintainerPage() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes);
  const selectedNode = useSelector(selectSelectedNode);
  const currentTab = useSelector(selectCurrentTab);
  const [showPolygonEditor, setShowPolygonEditor] = useState(false);
  const [editingPolygon, setEditingPolygon] = useState(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchNodes());
  }, [dispatch]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewTab />;
      case 'roadConfig':
        return <RoadConfigTab />;
      case 'nodeConfig':
        return <NodeConfigTab />;
      case 'health':
        return <HealthTab />;
      case 'polygons':
        return <PolygonsTab onEditPolygon={(poly) => {
          setEditingPolygon(poly);
          setShowPolygonEditor(true);
        }} />;
      default:
        return null;
    }
  };

  const handleCreateNode = (nodePayload) => {
    dispatch(registerNode(nodePayload))
      .unwrap()
      .then(() => {
        dispatch(selectNode(nodePayload.nodeId));
        dispatch(setCurrentTab('nodeConfig'));
        setShowAddNodeModal(false);
      });
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setIsDeleting(true);
    setDeleteError('');

    dispatch(deleteNode(selectedNode.id))
      .unwrap()
      .then(() => {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      })
      .catch((error) => {
        setIsDeleting(false);
        setDeleteError(error || 'Failed to delete node');
      });
  };

  const handleEditNode = (formData) => {
    if (!selectedNode) return;
    setIsEditing(true);
    setEditError('');

    dispatch(updateNode({ nodeId: selectedNode.id, updates: formData }))
      .unwrap()
      .then(() => {
        setIsEditing(false);
        setShowEditModal(false);
      })
      .catch((error) => {
        setIsEditing(false);
        setEditError(error || 'Failed to update node');
      });
  };

  return (
    <div 
      className="flex h-full w-full overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(143.67381513661007deg, rgb(249, 250, 251) 0%, rgb(243, 244, 246) 100%)'
      }}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        <NodeMaintainerHeader onAddNode={() => setShowAddNodeModal(true)} />

        <div className="flex gap-[12px] lg:gap-[16px] xl:gap-[20px] px-[12px] lg:px-[16px] xl:px-[20px] py-[12px] lg:py-[16px] xl:py-[20px] overflow-hidden flex-1 h-full">
          {/* Left Section: Map and Nodes List */}
          <div className="w-[35%] lg:w-[38%] xl:w-[40%] 2xl:w-[42%] flex flex-col gap-[8px] lg:gap-[12px] xl:gap-[16px] overflow-hidden">
            <div className="h-1/2 overflow-hidden">
              <NetworkMapCard />
            </div>
            <div className="h-1/2 overflow-hidden">
              <NodesListCard />
            </div>
          </div>

          {/* Right Section: Node Details or Empty State */}
          {selectedNode ? (
            <NodeDetailPanel
              selectedNode={selectedNode}
              currentTab={currentTab}
              onTabChange={(tabId) => dispatch(setCurrentTab(tabId))}
              onEdit={() => setShowEditModal(true)}
              onDelete={() => setShowDeleteConfirm(true)}
              isEditing={isEditing}
              isDeleting={isDeleting}
              renderTabContent={renderTabContent}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/50 border border-[#e5e7eb] rounded-[8px] lg:rounded-[10px] xl:rounded-[13.684px]">
              <div className="text-center px-[20px]">
                <FontAwesomeIcon
                  icon="circle-info"
                  className="text-[#99a1af] mb-[12px]"
                  style={{ width: 'clamp(32px, 5vw, 48px)', height: 'clamp(32px, 5vw, 48px)' }}
                />
                <p
                  className="text-[#6a7282]"
                  style={{ fontSize: 'clamp(12px, 1.2vw, 14px)', fontFamily: 'Arimo, sans-serif' }}
                >
                  Select a node from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditNodeModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditError(''); }}
        onSave={handleEditNode}
        node={selectedNode}
        isLoading={isEditing}
        error={editError}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Node"
        message={
          selectedNode
            ? `This will permanently remove ${selectedNode.id} and all related configuration.`
            : 'This will permanently remove the selected node.'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleDeleteNode}
        onCancel={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
        isDangerous
        errorMessage={deleteError}
      />

      {showPolygonEditor && (
        <PolygonEditorDialog
          node={selectedNode}
          polygon={editingPolygon}
          onClose={() => { setShowPolygonEditor(false); setEditingPolygon(null); }}
        />
      )}

      <AddNodeModal
        isOpen={showAddNodeModal}
        onClose={() => setShowAddNodeModal(false)}
        onSubmit={handleCreateNode}
        existingNodeIds={nodes.map((n) => n.id)}
      />
    </div>
  );
}
