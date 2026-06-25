import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllNodes, selectSelectedNodeId, selectNode } from '../../nodesSlice';
import NodeCard from '../cards/NodeCard';

export default function NodesDisplay() {
  const dispatch = useDispatch();
  const nodes = useSelector(selectAllNodes);
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectNode = (nodeId) => {
    dispatch(selectNode(nodeId));
  };

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.location.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'online') return node.status === 'online' && matchesSearch;
    if (filter === 'offline') return node.status === 'offline' && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="bg-safe-sidebar border border-safe-gray-light rounded-xl overflow-hidden flex flex-col flex-1 w-full">
      <div className="border-b border-safe-gray-light px-3.5 pt-2.5 pb-2">
        <div className="relative mb-2.5">
          <div className="bg-safe-gray border border-safe-gray-light rounded-lg flex items-center h-9 px-3">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full outline-none text-xs font-normal text-safe-text-primary placeholder-safe-text-muted"
            />
          </div>
        </div>

        <div className="flex gap-1.5 mb-2">
          {['all', 'online', 'offline'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`flex-1 h-7 rounded text-[10px] font-medium capitalize transition-all duration-200 ${
                filter === filterType
                  ? 'bg-safe-blue text-white'
                  : 'bg-safe-gray text-safe-text-muted hover:bg-safe-gray-light/50'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto px-2.5 pt-2.5 flex-1">
        <div className="flex flex-col gap-2 pb-2.5">
          {filteredNodes.length > 0 ? (
            filteredNodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                isSelected={node.id === selectedNodeId}
                onSelect={handleSelectNode}
              />
            ))
          ) : (
            <div className="flex items-center justify-center py-5 text-safe-text-muted">
              <span className="text-xs">No nodes found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
