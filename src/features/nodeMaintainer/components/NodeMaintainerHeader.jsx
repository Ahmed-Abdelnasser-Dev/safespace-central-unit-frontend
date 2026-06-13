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
    <div className="bg-safe-dark border-b border-safe-border/50 w-full">
      <div className="flex items-center justify-between py-8 px-8 gap-6 animate-slideUp">
        {/* Page Title & Description */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-safe-blue/20 to-safe-blue/5 rounded-lg flex items-center justify-center border border-safe-blue/30 flex-shrink-0">
            <FontAwesomeIcon icon="diagram-project" className="text-safe-blue text-xl" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Node Maintainer</h1>
            <p className="text-sm text-safe-text-gray/80 font-light mt-1">Manage, monitor and update network nodes</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 stagger-1">
          <Button
            variant="primary"
            size="sm"
            onClick={onAddNode}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon="plus" className="w-4 h-4" />
            Add Node
          </Button>
          {/* Search Bar */}
          <div className="relative group">
            <div className="relative flex items-center">
              <FontAwesomeIcon 
                icon="magnifying-glass" 
                className="absolute left-3 text-safe-text-gray/60 group-focus-within:text-safe-blue transition-colors duration-200"
              />
              <input
                type="text"
                placeholder="Search nodes..."
                className="bg-safe-gray/10 border border-safe-border/50 rounded-lg pl-10 pr-4 py-2.5 w-60 text-safe-text-dark placeholder-safe-text-gray/50 outline-none transition-all duration-200 focus:bg-white focus:border-safe-blue/50 focus:shadow-sm font-light text-sm"
              />
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            className="p-2.5 bg-safe-gray/10 hover:bg-safe-blue/10 border border-safe-border/50 rounded-lg transition-all duration-200 text-safe-text-gray hover:text-safe-blue"
            title="Refresh data"
          >
            <FontAwesomeIcon 
              icon="arrows-rotate" 
              className="w-5 h-5" 
            />
          </button>

          {/* Notification Button */}
          <div className="relative">
            <button 
              className="p-2.5 bg-safe-gray/10 hover:bg-safe-blue/10 border border-safe-border/50 rounded-lg transition-all duration-200 text-safe-text-gray hover:text-safe-blue"
              title="Notifications"
            >
              <FontAwesomeIcon 
                icon="bell" 
                className="w-5 h-5" 
              />
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-safe-danger rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
