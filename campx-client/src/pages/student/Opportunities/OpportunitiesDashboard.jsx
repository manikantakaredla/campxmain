import React, { useState } from 'react';
import OpportunityCards from './OpportunityCards';
import SavedTab from './SavedTab';
import PlacementsTab from './PlacementsTab';
import { Briefcase, Bookmark, Award, Trophy } from 'lucide-react';

const OpportunitiesDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Opportunities', icon: Briefcase },
    { id: 'hackathons', label: 'Hackathons', icon: Trophy },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'placements', label: 'Previous Placements', icon: Award }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all': return <OpportunityCards fixedType="" />;
      case 'hackathons': return <OpportunityCards fixedType="Hackathon" />;
      case 'saved': return <SavedTab />;
      case 'placements': return <PlacementsTab />;
      default: return <OpportunityCards fixedType="" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Placement & Career Hub</h1>
        <p className="text-gray-600 text-lg">Discover opportunities, track your applications, and learn from alumni.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-6 font-medium text-sm whitespace-nowrap transition-colors border-b-2 outline-none ${
                  isActive 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default OpportunitiesDashboard;
