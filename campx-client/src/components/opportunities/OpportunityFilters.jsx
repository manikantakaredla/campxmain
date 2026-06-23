import React from 'react';
import { Search, Filter } from 'lucide-react';

const OpportunityFilters = ({ onSearchChange, onTypeChange, onStatusChange, hideType }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search company, role..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-4">
        {!hideType && (
          <select 
            onChange={(e) => onTypeChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50"
          >
            <option value="">All Types</option>
            <option value="Placement Drive">Placement Drive</option>
            <option value="Internship">Internship</option>
            <option value="Job Opportunity">Job Opportunity</option>
            <option value="Hackathon">Hackathon</option>
          </select>
        )}

        <select 
          onChange={(e) => onStatusChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50"
        >
          <option value="">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    </div>
  );
};

export default OpportunityFilters;
