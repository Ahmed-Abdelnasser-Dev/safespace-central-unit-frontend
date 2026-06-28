/**
 * Node Maintainer Dashboard
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
import PageActions from '@/components/ui/PageActions';
import SearchInput from '@/components/ui/SearchInput.jsx';
import Button from '@/components/ui/Button.jsx';
import Tabs from '@/components/ui/Tabs.jsx';
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
import NodeCreationWizard from '../components/wizard/NodeCreationWizard.jsx';
import CameraViewPlaceholder from '../components/CameraViewPlaceholder.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PAGE_VIEWS = [
  { id: 'nodes', label: 'Nodes', icon: 'server' },
  { id: 'cameras', label: 'Cameras', icon: 'video' },
];

export default function NodeMaintainerPage() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes);
  const selectedNode = useSelector(selectSelectedNode);
  const currentTab = useSelector(selectCurrentTab);

  // Page-level view: 'nodes' | 'cameras'
  const [activeView, setActiveView] = useState('nodes');
  // Page-level search (wired to active view's content)
  const [pageSearch, setPageSearch] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState('');
  const [showPolygonEditor, setShowPolygonEditor] = useState(false);
  const [editingPolygon, setEditingPolygon] = useState(null);
  const [showNodeWizard, setShowNodeWizard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchNodes());
  }, [dispatch]);

  // Clear search when switching views
  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    setPageSearch('');
  };

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
        return (
          <PolygonsTab
            onEditPolygon={(poly) => {
              setEditingPolygon(poly);
              setShowPolygonEditor(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  const handleCreateNode = (nodePayload) => {
    setIsSubmitting(true);
    dispatch(registerNode(nodePayload))
      .unwrap()
      .then(() => {
        setIsSubmitting(false);
        dispatch(selectNode(nodePayload.nodeId));
        dispatch(setCurrentTab('overview'));
        setShowNodeWizard(false);
      })
      .catch((error) => {
        setIsSubmitting(false);
        setWizardError(error || 'Failed to create node. Please try again.');
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
    <div className="flex h-full w-full overflow-hidden bg-safe-dark">
      <PageActions>
        {/* Page-level view tabs */}
        <Tabs
          tabs={PAGE_VIEWS}
          activeTab={activeView}
          onChange={handleViewChange}
          size="sm"
        />

        {/* Search — filters active view */}
        <SearchInput
          placeholder={activeView === 'nodes' ? 'Search nodes, locations…' : 'Search cameras…'}
          value={pageSearch}
          onChange={(e) => setPageSearch(e.target.value)}
          width="240px"
        />

        {/* View-specific action */}
        {activeView === 'nodes' ? (
          <Button variant="primary" size="sm" icon="plus" onClick={() => setShowNodeWizard(true)}>
            Add Node
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon="plus" onClick={() => { /* Task 8 */ }}>
            Add Camera
          </Button>
        )}

        {/* Refresh */}
        <button
          onClick={() => dispatch(fetchNodes())}
          title="Refresh"
          className="w-9 h-9 rounded-lg border border-safe-border flex items-center justify-center text-safe-text-muted hover:bg-safe-gray transition-colors"
        >
          <FontAwesomeIcon icon="arrows-rotate" className="text-sm" />
        </button>
      </PageActions>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-[12px] lg:gap-[16px] xl:gap-[20px] px-[12px] lg:px-[16px] xl:px-[20px] py-[12px] lg:py-[16px] xl:py-[20px] overflow-hidden flex-1 h-full">

          {activeView === 'nodes' ? (
            <>
              {/* Left Section: Map and Nodes List */}
              <div className="w-[35%] lg:w-[38%] xl:w-[40%] 2xl:w-[42%] flex flex-col gap-[8px] lg:gap-[12px] xl:gap-[16px] overflow-hidden">
                {/* Map — dominant (60%) */}
                <div className="h-[60%] overflow-hidden">
                  <NetworkMapCard />
                </div>
                {/* Node list — compact (40%) */}
                <div className="h-[40%] overflow-hidden">
                  <NodesListCard externalSearch={pageSearch} />
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
                <div className="flex-1 flex items-center justify-center bg-safe-sidebar border border-safe-gray-light rounded-[8px] lg:rounded-[10px] xl:rounded-[13.684px]">
                  <div className="text-center px-[20px]">
                    <FontAwesomeIcon
                      icon="circle-info"
                      className="text-safe-text-muted mb-3 text-4xl"
                    />
                    <p className="text-sm text-safe-text-muted">
                      Select a node from the list to view details
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Cameras view — full-width placeholder, replaced in Task 8 */
            <CameraViewPlaceholder searchQuery={pageSearch} />
          )}
        </div>
      </div>

      {/* Modals — always rendered regardless of active view */}
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
        confirmText={isDeleting ? 'Deleting…' : 'Delete'}
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

      <NodeCreationWizard
        isOpen={showNodeWizard}
        onClose={() => { setWizardError(''); setShowNodeWizard(false); }}
        onSubmit={handleCreateNode}
        existingNodeIds={nodes.map((n) => n.id)}
        isSubmitting={isSubmitting}
        submissionError={wizardError}
      />
    </div>
  );
}
