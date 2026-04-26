/**
 * NodeCard Component
 * 
 * Displays a single node with status badge, location, and health metrics
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.node - Node data object with id, status, location, health
 * @param {string} props.node.id - Node identifier
 * @param {string} props.node.status - 'online' or 'offline'
 * @param {Object} props.node.location - { address: string }
 * @param {Object} props.node.health - { cpu, temperature, network }
 * @param {boolean} props.isSelected - Whether node is currently selected
 * @param {Function} props.onSelect - Callback when node is clicked
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function NodeCard({ node, isSelected, onSelect }) {
  const statusColor = node.status === 'online' ? '#4caf50' : '#e83e3e';

  return (
    <button
      onClick={() => onSelect(node.id)}
      className={`w-full rounded-[8.285px] border-[1.364px] text-left transition-all duration-200 hover:shadow-m ${
        isSelected 
          ? 'bg-[#f0f6ff] border-[#247cff] shadow-sm' 
          : 'bg-[#f7f8f9] border-transparent hover:bg-[#eff0f1]'
      }`}
      style={{ height: '90px' }}
    >
      <div className="px-[14px] py-[12px]">
        {/* Node ID and Status */}
        <div className="flex items-center justify-between mb-[6px]">
          <div className="flex items-center gap-[8px] flex-1 min-w-0">
            <div 
              className="rounded-full flex-shrink-0" 
              style={{ 
                width: '8px', 
                height: '8px',
                backgroundColor: statusColor 
              }} 
            />
            <span 
              className="font-bold text-[#101828] truncate"
              style={{ 
                fontSize: 'clamp(12px, 1.3vw, 14px)',
                lineHeight: '16.157px',
                fontFamily: 'Arimo, sans-serif'
              }}
            >
              {node.id}
            </span>
          </div>
          <span 
            className={`text-xs font-medium px-[8px] py-[3px] rounded-[4px] flex-shrink-0 ml-[8px] ${
              node.status === 'online' ? 'bg-[#e8f5e9] text-[#4caf50]' : 'bg-[#fee2e2] text-[#d63e4d]'
            }`}
            style={{ 
              fontSize: 'clamp(10px, 1.1vw, 11px)',
              lineHeight: '13.671px',
              fontFamily: 'Arimo, sans-serif'
            }}
          >
            {node.status}
          </span>
        </div>

        {/* Location */}
        <p 
          className="text-[#6a7282] mb-[6px] truncate"
          style={{ 
            fontSize: 'clamp(11px, 1.2vw, 12px)',
            lineHeight: '14.914px',
            fontFamily: 'Arimo, sans-serif'
          }}
        >
          {node.location.address}
        </p>

        {/* Metrics */}
        <div className="flex items-center gap-[14px] flex-wrap">
          {/* CPU */}
          <div className="flex items-center gap-[4px]">
            <FontAwesomeIcon 
              icon="microchip" 
              className="text-[#6a7282] flex-shrink-0" 
              style={{ 
                width: 'clamp(9px, 1.2vw, 11px)',
                height: 'clamp(9px, 1.2vw, 11px)'
              }}
            />
            <span 
              className="text-[#6a7282] whitespace-nowrap"
              style={{ 
                fontSize: 'clamp(10px, 1.1vw, 12px)',
                lineHeight: '12.428px',
                fontFamily: 'Arimo, sans-serif'
              }}
            >
              {node.health.cpu}%
            </span>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-[4px]">
            <FontAwesomeIcon 
              icon="temperature-half" 
              className="text-[#6a7282] flex-shrink-0" 
              style={{ 
                width: 'clamp(9px, 1.2vw, 11px)',
                height: 'clamp(9px, 1.2vw, 11px)'
              }}
            />
            <span 
              className="text-[#6a7282] whitespace-nowrap"
              style={{ 
                fontSize: 'clamp(10px, 1.1vw, 12px)',
                lineHeight: '12.428px',
                fontFamily: 'Arimo, sans-serif'
              }}
            >
              {node.health.temperature}°C
            </span>
          </div>

          {/* Network */}
          <div className="flex items-center gap-[4px]">
            <FontAwesomeIcon 
              icon="wifi" 
              className="text-[#6a7282] flex-shrink-0" 
              style={{ 
                width: 'clamp(9px, 1.2vw, 11px)',
                height: 'clamp(9px, 1.2vw, 11px)'
              }}
            />
            <span 
              className="text-[#6a7282] whitespace-nowrap"
              style={{ 
                fontSize: 'clamp(10px, 1.1vw, 12px)',
                lineHeight: '12.428px',
                fontFamily: 'Arimo, sans-serif'
              }}
            >
              {node.health.network}%
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
