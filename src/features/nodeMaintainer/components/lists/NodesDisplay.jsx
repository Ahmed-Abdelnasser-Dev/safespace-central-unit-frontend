/**
 * NodesDisplay Component
 * 
 * Displays a list of nodes with search functionality and filter tabs
 * Manages filtering and selection state
 * 
 * @component
 */

import React, { useState } from 'react';
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

  // Filter nodes based on selection
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'online') return node.status === 'online' && matchesSearch;
    if (filter === 'offline') return node.status === 'offline' && matchesSearch;
    return matchesSearch;
  });

  return (
    <div 
      className="bg-white border border-[#e5e7eb] rounded-[13.684px] overflow-hidden flex flex-col flex-1 w-full"
    >
      {/* Header with Search and Filter Tabs */}
      <div className="border-b border-[#e5e7eb] px-[13.255px] pt-[10px] pb-[8px]">
        {/* Search Input */}
        <div className="relative mb-[10px]">
          <div 
            className="border border-[#e5e7eb] rounded-[6.628px] flex items-center pl-[26.513px] pr-[8.285px] py-[8px]"
            style={{ height: '36px' }}
          >
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full outline-none font-normal"
              style={{ 
                fontSize: 'clamp(11px, 1.2vw, 12px)',
                fontFamily: 'Arimo, sans-serif',
                color: 'rgba(16,24,40,0.5)'
              }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-[6px] mb-[8px]">
          {['all', 'online', 'offline'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`flex-1 rounded-[4.971px] flex items-center justify-center transition-all duration-200 font-medium ${
                filter === filterType ? 'bg-[#247cff] shadow-sm' : 'bg-[#f7f8f9] hover:bg-[#e8e9ea]'
              }`}
              style={{ height: '28px' }}
            >
              <span 
                className={`font-medium capitalize ${filter === filterType ? 'text-white' : 'text-[#6a7282]'}`}
                style={{ 
                  fontSize: 'clamp(10px, 1.1vw, 11px)',
                  lineHeight: '13.671px',
                  fontFamily: 'Arimo, sans-serif'
                }}
              >
                {filterType}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Nodes List */}
      <div className="overflow-y-auto px-[10px] pt-[10px] flex-1">
        <div className="flex flex-col gap-[8px] pb-[10px]">
          {filteredNodes.length > 0 ? (
            filteredNodes.map(node => (
              <NodeCard
                key={node.id}
                node={node}
                isSelected={node.id === selectedNodeId}
                onSelect={handleSelectNode}
              />
            ))
          ) : (
            <div className="flex items-center justify-center py-[20px] text-[#6a7282]">
              <span style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', fontFamily: 'Arimo, sans-serif' }}>
                No nodes found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
