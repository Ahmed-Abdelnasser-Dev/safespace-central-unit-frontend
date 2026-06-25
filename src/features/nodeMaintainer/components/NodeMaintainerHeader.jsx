/**
 * Node Maintainer Header - Pixel Perfect Figma Design
 * 
 * Exact specifications from Figma design
 * - Background: white
 * - Border: #e5e7eb
 * - Title: 20.645px, #101828, Arimo Bold
 * - Subtitle: 12.387px, #6a7282, Arimo Regular
 * 
 * @component
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@/components/ui/Button.jsx';

export default function NodeMaintainerHeader({ onAddNode }) {
  return (
    <div className="bg-safe-sidebar border-b border-safe-gray-light w-full">
      <div className="flex items-center justify-between py-[10px] px-[20px]">
        {/* Page Title & Description */}
        <div>
          <h1
            className="font-bold text-safe-text-primary mb-[4px]"
            style={{ fontSize: '20.645px', lineHeight: '28.903px', fontFamily: 'Arimo, sans-serif' }}
          >
            Node Maintainer
          </h1>
          <p
            className="font-normal text-safe-text-muted"
            style={{ fontSize: '12.387px', lineHeight: '16.516px', fontFamily: 'Arimo, sans-serif' }}
          >
            Manage, Monitor and update Nodes
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-[20px]">
          <Button
            variant="primary"
            size="sm"
            onClick={onAddNode}
            className="h-[41.29px] px-[14px]"
          >
            <span className="flex items-center gap-[8px]">
              <FontAwesomeIcon icon="plus" style={{ width: '14px', height: '14px' }} />
              Add Node
            </span>
          </Button>
          {/* Search Bar */}
          <div className="relative group">
            <div
              className="bg-safe-gray border border-safe-gray-light rounded-[8.258px] flex items-center pl-[41.29px] pr-[12.387px] py-[4.129px] transition-all duration-200 group-focus-within:border-safe-blue group-hover:border-safe-gray-light"
              style={{ width: '396.387px', height: '41.29px' }}
            >
              <input
                type="text"
                placeholder="Search locations, units, incidents..."
                className="bg-transparent w-full text-safe-text-muted outline-none font-normal placeholder-safe-text-muted focus:text-safe-text-primary"
                style={{ fontSize: '14.452px', fontFamily: 'Arimo, sans-serif' }}
              />
            </div>
            <div className="absolute left-[12.39px] top-[12.39px] pointer-events-none group-focus-within:text-safe-blue transition-colors duration-200">
              <FontAwesomeIcon
                icon="magnifying-glass"
                className="text-safe-text-muted"
                style={{ width: '16.516px', height: '16.516px' }}
              />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            className="bg-safe-gray border border-safe-gray-light rounded-[8.258px] flex items-center justify-center hover:bg-safe-gray-light transition-all duration-200"
            style={{ width: '41.29px', height: '41.29px' }}
            title="Refresh data"
          >
            <FontAwesomeIcon
              icon="arrows-rotate"
              className="text-safe-text-muted"
              style={{ width: '16.516px', height: '16.516px' }}
            />
          </button>

          {/* Notification Button with Badge */}
          <div className="relative group">
            <button
              className="bg-safe-gray border border-safe-gray-light rounded-[8.258px] flex items-center justify-center hover:bg-safe-gray-light transition-all duration-200"
              style={{ width: '41.29px', height: '41.29px' }}
              title="View notifications"
            >
              <FontAwesomeIcon
                icon="bell"
                className="text-safe-text-muted"
                style={{ width: '16.516px', height: '16.516px' }}
              />
            </button>
            <div
              className="absolute bg-safe-danger rounded-[8.258px] flex items-center justify-center text-white font-bold shadow-sm"
              style={{
                width: '20.645px',
                height: '20.645px',
                top: '-2.06px',
                right: '-2.06px',
                fontSize: '11px',
                lineHeight: '16.516px',
                fontFamily: 'Arimo, sans-serif'
              }}
            >
              3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
